// WebGL-based Fuji Film Filter Renderer

import type { FilterParams } from './filters';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  
  // Filter parameters
  uniform float u_saturation;
  uniform float u_contrast;
  uniform float u_brightness;
  uniform float u_exposure;
  uniform vec3 u_shadows;
  uniform vec3 u_midtones;
  uniform vec3 u_highlights;
  uniform float u_hueShift;
  uniform float u_temperature;
  uniform float u_tint;
  uniform float u_grain;
  uniform float u_vignette;
  uniform float u_desaturate;
  uniform float u_fade;
  uniform vec2 u_resolution;
  uniform float u_time;

  vec3 rgb2hsl(vec3 c) {
    float maxC = max(c.r, max(c.g, c.b));
    float minC = min(c.r, min(c.g, c.b));
    float l = (maxC + minC) / 2.0;
    float s = 0.0;
    float h = 0.0;
    if (maxC != minC) {
      float d = maxC - minC;
      s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
      if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
      else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;
      else h = (c.r - c.g) / d + 4.0;
      h /= 6.0;
    }
    return vec3(h, s, l);
  }

  float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
  }

  vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x, s = hsl.y, l = hsl.z;
    if (s == 0.0) return vec3(l);
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(
      hue2rgb(p, q, h + 1.0/3.0),
      hue2rgb(p, q, h),
      hue2rgb(p, q, h - 1.0/3.0)
    );
  }

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    vec3 color = texColor.rgb;
    
    // Exposure
    color *= pow(2.0, u_exposure);
    
    // Temperature & Tint
    color.r += u_temperature * 0.1;
    color.b -= u_temperature * 0.1;
    color.g += u_tint * 0.05;
    
    // Tone curve adjustments (shadows, midtones, highlights)
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float shadowWeight = 1.0 - smoothstep(0.0, 0.4, luminance);
    float highlightWeight = smoothstep(0.6, 1.0, luminance);
    float midtoneWeight = 1.0 - shadowWeight - highlightWeight;
    
    color += u_shadows * shadowWeight;
    color += u_midtones * midtoneWeight;
    color += u_highlights * highlightWeight;
    
    // Hue shift
    if (u_hueShift != 0.0) {
      vec3 hsl = rgb2hsl(color);
      hsl.x += u_hueShift / 360.0;
      color = hsl2rgb(hsl);
    }
    
    // Contrast (around 0.5)
    color = (color - 0.5) * u_contrast + 0.5;
    
    // Brightness
    color += u_brightness;
    
    // Saturation
    float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(gray), color, u_saturation);
    
    // Desaturation (for B&W filters)
    if (u_desaturate > 0.0) {
      float bwGray = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(color, vec3(bwGray), u_desaturate);
    }
    
    // Fade (lift blacks)
    color = mix(vec3(u_fade), vec3(1.0), color);
    
    // Film grain
    if (u_grain > 0.0) {
      float grainNoise = rand(v_texCoord + u_time) * 2.0 - 1.0;
      color += grainNoise * u_grain * 0.15;
    }
    
    // Vignette
    if (u_vignette > 0.0) {
      vec2 center = v_texCoord - 0.5;
      float dist = length(center * vec2(u_resolution.x / u_resolution.y, 1.0));
      float vig = smoothstep(0.4, 1.2, dist);
      color *= 1.0 - vig * u_vignette;
    }
    
    // Clamp
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, texColor.a);
  }
`;

export class FilterRenderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private canvas: HTMLCanvasElement;
  private texture: WebGLTexture | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;
    this.initShaders();
    this.initBuffers();
  }

  private initShaders() {
    const gl = this.gl!;
    
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
    }

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
    }
    gl.useProgram(this.program);
  }

  private initBuffers() {
    const gl = this.gl!;
    const program = this.program!;

    // Position buffer (full-screen quad)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0,
    ]), gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
  }

  setImage(image: HTMLImageElement | HTMLCanvasElement) {
    const gl = this.gl!;
    
    if (this.texture) gl.deleteTexture(this.texture);
    
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  render(filter: FilterParams) {
    const gl = this.gl!;
    const program = this.program!;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const setUniform1f = (name: string, value: number) => {
      gl.uniform1f(gl.getUniformLocation(program, name), value);
    };
    const setUniform2f = (name: string, x: number, y: number) => {
      gl.uniform2f(gl.getUniformLocation(program, name), x, y);
    };
    const setUniform3f = (name: string, x: number, y: number, z: number) => {
      gl.uniform3f(gl.getUniformLocation(program, name), x, y, z);
    };

    setUniform1f('u_saturation', filter.saturation);
    setUniform1f('u_contrast', filter.contrast);
    setUniform1f('u_brightness', filter.brightness);
    setUniform1f('u_exposure', filter.exposure);
    setUniform3f('u_shadows', filter.shadowsR, filter.shadowsG, filter.shadowsB);
    setUniform3f('u_midtones', filter.midtonesR, filter.midtonesG, filter.midtonesB);
    setUniform3f('u_highlights', filter.highlightsR, filter.highlightsG, filter.highlightsB);
    setUniform1f('u_hueShift', filter.hueShift);
    setUniform1f('u_temperature', filter.temperature);
    setUniform1f('u_tint', filter.tint);
    setUniform1f('u_grain', filter.grain);
    setUniform1f('u_vignette', filter.vignette);
    setUniform1f('u_desaturate', filter.desaturate);
    setUniform1f('u_fade', filter.fade);
    setUniform2f('u_resolution', this.canvas.width, this.canvas.height);
    setUniform1f('u_time', performance.now() / 1000);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  toBlob(quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        'image/jpeg',
        quality
      );
    });
  }

  destroy() {
    if (this.gl && this.texture) {
      this.gl.deleteTexture(this.texture);
    }
  }
}
