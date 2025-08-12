<template>
  <div class="canvas-container">
    <canvas ref="canvas" :width="width" :height="height" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
    <div class="canvas-controls">
      <button @click="clearCanvas" class="btn btn-secondary">Clear</button>
      <input type="color" v-model="currentColor" title="Choose color">
      <input type="range" v-model="lineWidth" min="1" max="20" title="Line width">
    </div>
  </div>
</template>

<script>
export default {
  name: 'CanvasInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 400
    },
    backgroundImage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      isDrawing: false,
      currentColor: '#000000',
      lineWidth: 5,
      lastX: 0,
      lastY: 0,
      image: null
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Load background image if provided
    if (this.backgroundImage) {
      this.image = new Image();
      this.image.onload = () => {
        // Draw the image maintaining aspect ratio
        const scale = Math.min(
          this.width / this.image.width,
          this.height / this.image.height
        );
        const x = (this.width - this.image.width * scale) / 2;
        const y = (this.height - this.image.height * scale) / 2;
        this.ctx.drawImage(
          this.image,
          x, y,
          this.image.width * scale,
          this.image.height * scale
        );
      };
      this.image.src = this.backgroundImage;
    }

    // Load existing drawing if value exists
    if (this.value) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0);
      };
      img.src = this.value;
    }
  },
  methods: {
    startDrawing(event) {
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
    },
    draw(event) {
      if (!this.isDrawing) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      
      this.lastX = currentX;
      this.lastY = currentY;
      
      this.$emit('input', this.canvas.toDataURL());
    },
    stopDrawing() {
      this.isDrawing = false;
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      // Redraw background image if it exists
      if (this.image) {
        const scale = Math.min(
          this.width / this.image.width,
          this.height / this.image.height
        );
        const x = (this.width - this.image.width * scale) / 2;
        const y = (this.height - this.image.height * scale) / 2;
        this.ctx.drawImage(
          this.image,
          x, y,
          this.image.width * scale,
          this.image.height * scale
        );
      }
      this.$emit('input', this.canvas.toDataURL());
    }
  }
}
</script>

<style scoped>
.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

canvas {
  border: 1px solid #ccc;
  background: white;
  cursor: crosshair;
}

.canvas-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

input[type="color"] {
  width: 50px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type="range"] {
  width: 100px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style> 