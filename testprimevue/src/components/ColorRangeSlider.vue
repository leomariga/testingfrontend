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
            v-for="(color, index) in [...gradientColors].reverse()" 
            :key="index"
            class="color-segment"
            :style="{ 
              background: color,
              height: `${100 / gradientColors.length}%`
            }"
          />
        </div>
      </div>
      
      <div class="handles-container">
        <div 
          class="slider-handle max-handle"
          :style="{ top: `${maxHandlePosition}%` }"
          @mousedown="startDrag($event, 'max')"
        >
          <div class="handle-content">
            <div class="handle-label">Máximo</div>
            <div class="handle-value">{{ formatCurrency(maxValue) }}</div>
            <div class="handle-grip"></div>
          </div>
        </div>
        
        <div 
          class="slider-handle min-handle"
          :style="{ top: `${minHandlePosition}%` }"
          @mousedown="startDrag($event, 'min')"
        >
          <div class="handle-content">
            <div class="handle-label">Mínimo</div>
            <div class="handle-value">{{ formatCurrency(minValue) }}</div>
            <div class="handle-grip"></div>
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
      this.gradientColors = Array.from({ length: steps }).map((_, i) => {
        return this.interpolateViridis(i / (steps - 1))
      })
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
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 20px;
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
  width: 60px;
  margin: 0 20px;
}

.color-bar-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
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
  left: 0;
  transform: translateY(-50%);
  width: 140px;
  height: 24px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  cursor: pointer;
  z-index: 2;
  box-shadow: var(--card-shadow);
}

.handle-content {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  background: var(--surface-card);
  border-radius: 4px;
}

.handle-label {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-right: 8px;
}

.handle-value {
  white-space: nowrap;
  font-size: 0.85rem;
  color: var(--text-color);
  flex: 1;
}

.handle-grip {
  width: 12px;
  height: 12px;
  margin-left: 8px;
  position: relative;
}

.handle-grip::before,
.handle-grip::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--text-color-secondary);
  border-radius: 1px;
}

.handle-grip::before {
  top: 2px;
}

.handle-grip::after {
  bottom: 2px;
}

.handles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.price-scale {
  position: absolute;
  right: 100%;
  height: 100%;
  margin-right: 12px;
  width: 100px;
}

.price-tick {
  position: absolute;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  width: 100%;
}

.price-label {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin-right: 8px;
  white-space: nowrap;
}

.tick-line {
  flex: 1;
  height: 1px;
  background: var(--surface-border);
}
</style> 