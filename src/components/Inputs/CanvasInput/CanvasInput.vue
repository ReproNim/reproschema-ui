<template>
  <div class="CanvasInput">
    <b-form ref="form" @submit="onSubmit">
      <div class="canvas-container">
        <canvas 
          ref="drawingCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="startDrawing"
          @touchmove="draw"
          @touchend="stopDrawing"
        ></canvas>
        <div class="canvas-controls mt-2">
          <b-button variant="secondary" @click="clearCanvas" class="mr-2">Clear</b-button>
          <b-button variant="primary" @click="undo" :disabled="!canUndo">Undo</b-button>
        </div>
      </div>
      <b-button type="submit" class="mt-3">{{ $t('submit-button')}}</b-button>
    </b-form>
  </div>
</template>

<script>
import config from '@/config';

export default {
  name: 'CanvasInput',
  props: ['constraints', 'init', 'selected_language', 'backgroundImage'],
  data() {
    return {
      isDrawing: false,
      canvasWidth: 800,
      canvasHeight: 400,
      lastX: 0,
      lastY: 0,
      drawingHistory: [],
      currentPath: [],
      canUndo: false,
      image: null,
      ctx: null
    }
  },
  mounted() {
    console.log('CanvasInput mounted with backgroundImage:', this.backgroundImage);
    this.initializeCanvas()
    if (this.init) {
      this.loadInitialDrawing(this.init)
    }
    if (this.backgroundImage) {
      console.log('Loading background image:', this.backgroundImage);
      this.image = new Image();
      this.image.crossOrigin = 'anonymous';
      this.image.onload = () => {
        console.log('Background image loaded successfully');
        // Draw the image maintaining aspect ratio
        const scale = Math.min(
          this.canvasWidth / this.image.width,
          this.canvasHeight / this.image.height
        );
        const x = (this.canvasWidth - this.image.width * scale) / 2;
        const y = (this.canvasHeight - this.image.height * scale) / 2;
        this.ctx.drawImage(
          this.image,
          x, y,
          this.image.width * scale,
          this.image.height * scale
        );
      };
      this.image.onerror = (error) => {
        console.error('Error loading background image:', error);
      };
      // Use the protocol URL from config
      const baseUrl = config.githubSrc.split('/DemoProtocol/')[0];
      const imagePath = this.backgroundImage.startsWith('./') ? this.backgroundImage.slice(2) : this.backgroundImage;
      this.image.src = `${baseUrl}/activities/VisuospatialExecutive/${imagePath}`;
    }
  },
  methods: {
    initializeCanvas() {
      const canvas = this.$refs.drawingCanvas
      this.ctx = canvas.getContext('2d')
      this.ctx.strokeStyle = '#000000'
      this.ctx.lineWidth = 2
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'
    },
    startDrawing(event) {
      this.isDrawing = true
      const pos = this.getPosition(event)
      this.lastX = pos.x
      this.lastY = pos.y
      this.currentPath = [{ x: pos.x, y: pos.y }]
    },
    draw(event) {
      if (!this.isDrawing) return
      
      const pos = this.getPosition(event)
      
      this.ctx.beginPath()
      this.ctx.moveTo(this.lastX, this.lastY)
      this.ctx.lineTo(pos.x, pos.y)
      this.ctx.stroke()
      
      this.lastX = pos.x
      this.lastY = pos.y
      this.currentPath.push({ x: pos.x, y: pos.y })
    },
    stopDrawing() {
      if (this.isDrawing) {
        this.isDrawing = false
        if (this.currentPath.length > 1) {
          this.drawingHistory.push(this.currentPath)
          this.canUndo = true
        }
      }
    },
    getPosition(event) {
      const canvas = this.$refs.drawingCanvas
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX || event.touches[0].clientX) - rect.left
      const y = (event.clientY || event.touches[0].clientY) - rect.top
      return { x, y }
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.drawingHistory = []
      this.canUndo = false
      if (this.image) {
        // Redraw background image if it exists
        const scale = Math.min(
          this.canvasWidth / this.image.width,
          this.canvasHeight / this.image.height
        );
        const x = (this.canvasWidth - this.image.width * scale) / 2;
        const y = (this.canvasHeight - this.image.height * scale) / 2;
        this.ctx.drawImage(
          this.image,
          x, y,
          this.image.width * scale,
          this.image.height * scale
        );
      }
      this.$emit('input', this.$refs.drawingCanvas.toDataURL());
    },
    undo() {
      if (this.drawingHistory.length > 0) {
        this.drawingHistory.pop()
        this.redrawCanvas()
        this.canUndo = this.drawingHistory.length > 0
      }
    },
    redrawCanvas() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      this.drawingHistory.forEach(path => {
        if (path.length > 1) {
          this.ctx.beginPath()
          this.ctx.moveTo(path[0].x, path[0].y)
          for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y)
          }
          this.ctx.stroke()
        }
      })
    },
    loadInitialDrawing(data) {
      if (data && data.paths) {
        this.drawingHistory = data.paths
        this.redrawCanvas()
        this.canUndo = this.drawingHistory.length > 0
      }
    },
    onSubmit(e) {
      e.preventDefault()
      const canvas = this.$refs.drawingCanvas
      const imageData = canvas.toDataURL('image/png')
      this.$emit('valueChanged', {
        imageData,
        paths: this.drawingHistory
      })
    }
  }
}
</script>

<style scoped>
.canvas-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  background: #fff;
}

canvas {
  border: 1px solid #ddd;
  border-radius: 4px;
  touch-action: none;
}
</style> 