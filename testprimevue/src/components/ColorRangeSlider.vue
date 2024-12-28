<template>
  <div class="color-range-slider">
    <div class="slider-title">Faixa de preços/m²</div>
    <div class="slider-container">
      <!-- Price scale ticks -->
      <div class="price-scale">
        <div 
          v-for="(tick, index) in priceScaleTicks" 
          :key="index"
          class="price-tick"
          :style="{ top: `${tick.position}%` }"
        >
          <span class="price-label">{{ formatCurrency(tick.value) }}</span>
          <div class="tick-line"></div>
        </div>
      </div>

      <div class="central-line">
        <div 
          v-for="(tick, index) in priceScaleTicks" 
          :key="index"
          class="central-tick"
          :style="{ top: `${tick.position}%` }"
        >
          <div class="tick-mark"></div>
        </div>
      </div>

      <div class="color-bar-container" ref="colorBar">
        <!-- Background bar -->
        <div class="color-bar-background"></div>
        <!-- Active color gradient -->
        <div 
          class="color-bar-active"
          :style="{
            top: `${maxHandlePosition}%`,
            height: `${minHandlePosition - maxHandlePosition}%`
          }"
        >
          <div 
            v-for="(color, index) in gradientColors" 
            :key="index"
            class="color-segment"
            :style="{ 
              background: color,
              height: `${100 / gradientColors.length}%`
            }"
          />
        </div>
        <div class="handle-markers">
          <div 
            class="handle-marker max-marker"
            :style="{ top: `${maxHandlePosition}%` }"
          ></div>
          <div 
            class="handle-marker min-marker"
            :style="{ top: `${minHandlePosition}%` }"
          ></div>
        </div>
      </div>
      
      <div class="handles-container">
        <div 
          class="slider-handle max-handle"
          :style="{ top: `${maxHandlePosition}%` }"
          @mousedown="startDrag($event, 'max')"
        >
          <div class="handle-diamond">
            <div class="handle-tooltip">{{ formatCurrency(maxValue) }}</div>
          </div>
        </div>
        
        <div 
          class="slider-handle min-handle"
          :style="{ top: `${minHandlePosition}%` }"
          @mousedown="startDrag($event, 'min')"
        >
          <div class="handle-diamond">
            <div class="handle-tooltip">{{ formatCurrency(minValue) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorRangeSlider',
  props: {
    defaultMin: {
      type: Number,
      required: true
    },
    defaultMax: {
      type: Number,
      required: true
    },
    absoluteMin: {
      type: Number,
      required: true
    },
    absoluteMax: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      minValue: this.defaultMin,
      maxValue: this.defaultMax,
      isDragging: false,
      activeHandle: null,
      gradientColors: [],
      tickCount: 5
    }
  },
  computed: {
    minHandlePosition() {
      return this.valueToPosition(this.minValue)
    },
    maxHandlePosition() {
      return this.valueToPosition(this.maxValue)
    },
    priceScaleTicks() {
      const count = 6
      return Array.from({ length: count }, (_, i) => {
        const value = this.absoluteMin + (this.absoluteMax - this.absoluteMin) * (i / (count - 1))
        return {
          value,
          position: 100 - (100 * (i / (count - 1)))
        }
      })
    }
  },
  mounted() {
    this.updateGradientColors()
    window.addEventListener('mousemove', this.handleDrag)
    window.addEventListener('mouseup', this.stopDrag)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.handleDrag)
    window.removeEventListener('mouseup', this.stopDrag)
  },
  methods: {
    startDrag(event, handle) {
      this.isDragging = true
      this.activeHandle = handle
      event.preventDefault()
    },
    handleDrag(event) {
      if (!this.isDragging) return

      const sliderRect = this.$refs.colorBar.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100,
        ((event.clientY - sliderRect.top) / sliderRect.height) * 100
      ))
      
      const value = this.positionToValue(percentage)
      
      if (this.activeHandle === 'min') {
        this.minValue = Math.min(this.maxValue, value)
      } else {
        this.maxValue = Math.max(this.minValue, value)
      }

      this.$emit('range-changed', {
        min: this.minValue,
        max: this.maxValue
      })
    },
    stopDrag() {
      this.isDragging = false
      this.activeHandle = null
    },
    valueToPosition(value) {
      return 100 - ((value - this.absoluteMin) / (this.absoluteMax - this.absoluteMin) * 100)
    },
    positionToValue(position) {
      return this.absoluteMin + ((100 - position) / 100) * (this.absoluteMax - this.absoluteMin)
    },
    formatCurrency(value) {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    },
    updateGradientColors() {
      const steps = 20
      this.gradientColors = Array.from({ length: steps })
        .map((_, i) => this.interpolateViridis(i / (steps - 1)))
        .reverse()
    },
    interpolateViridis(t) {
      const c0 = [68, 1, 84]     // Dark purple
      const c1 = [65, 182, 196]  // Turquoise
      const c2 = [253, 231, 37]  // Yellow

      let r, g, b
      if (t < 0.5) {
        const x = t * 2
        r = c0[0] + (c1[0] - c0[0]) * x
        g = c0[1] + (c1[1] - c0[1]) * x
        b = c0[2] + (c1[2] - c0[2]) * x
      } else {
        const x = (t - 0.5) * 2
        r = c1[0] + (c2[0] - c1[0]) * x
        g = c1[1] + (c2[1] - c1[1]) * x
        b = c1[2] + (c2[2] - c1[2]) * x
      }
      
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    }
  },
  watch: {
    minValue() {
      this.updateGradientColors()
    },
    maxValue() {
      this.updateGradientColors()
    }
  }
}
</script>

<style scoped>
.color-range-slider {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 16px;
  padding-right: 64px;
  width: 160px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  z-index: 1000;
}

.slider-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  text-align: center;
}

.slider-container {
  position: relative;
  height: 300px;
  width: 1px;
  margin: 0;
}

.color-bar-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 100%;
  border-radius: 10px;
  overflow: visible;
}

.color-bar-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
}

.color-bar-active {
  position: absolute;
  left: 0;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
}

.color-segment {
  width: 100%;
}

.slider-handle {
  position: absolute;
  right: -20px;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 2;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-diamond {
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.handle-tooltip {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--surface-card);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  box-shadow: var(--card-shadow);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.slider-handle:hover .handle-diamond {
  transform: rotate(45deg) scale(1.2);
}

.max-handle .handle-diamond {
  border-width: 2px;
  background: rgb(253, 231, 37);  /* Yellow */
  border: 2px solid rgb(200, 180, 0);
}

.min-handle .handle-diamond {
  border-width: 2px;
  background: rgb(68, 1, 84);     /* Purple */
  border: 2px solid rgb(40, 0, 50);
}

.max-handle:hover .handle-diamond {
  background: rgb(255, 240, 100);  /* Lighter yellow */
  border-color: rgb(253, 231, 37);
}

.min-handle:hover .handle-diamond {
  background: rgb(100, 20, 120);   /* Lighter purple */
  border-color: rgb(68, 1, 84);
}

.slider-handle:hover .handle-tooltip {
  opacity: 1;
}

.price-scale {
  position: absolute;
  left: 100%;
  height: 100%;
  margin-left: 16px;
  width: auto;
  max-width: 48px;
}

.price-tick {
  position: absolute;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  gap: 4px;
}

.price-label {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  white-space: nowrap;
  text-align: right;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tick-line {
  width: 4px;
  height: 1px;
  background: transparent;
}

.handle-markers {
  position: absolute;
  top: 0;
  left: -2px;
  right: -2px;
  height: 100%;
  pointer-events: none;
}

.handle-marker {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transform: translateY(-50%);
}

.max-marker {
  background: rgb(253, 231, 37);  /* Yellow */
}

.min-marker {
  background: rgb(68, 1, 84);     /* Purple */
}

.central-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(100% + 4px);
  width: 1px;
  background: #000;
}

.central-tick {
  position: absolute;
  transform: translateY(-50%);
}

.tick-mark {
  width: 4px;
  height: 1px;
  background: #000;
  margin-left: 1px;
}
</style> 