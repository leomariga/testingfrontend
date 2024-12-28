<template>
  <div class="date-range-slider">
    <div class="slider-container">
      <div class="date-scale">
        <div 
          v-for="(tick, index) in dateScaleTicks" 
          :key="index"
          class="date-tick"
          :style="{ top: `${tick.position}%` }"
        >
          <div class="tick-line"></div>
        </div>
      </div>

      <div class="central-line">
        <div 
          v-for="(tick, index) in dateScaleTicks" 
          :key="index"
          class="central-tick"
          :style="{ top: `${tick.position}%` }"
        >
          <div class="tick-mark"></div>
        </div>
      </div>

      <div class="slider-bar-container" ref="sliderBar">
        <div class="slider-bar-background"></div>
        <div 
          class="slider-bar-active"
          :style="{
            top: `${maxHandlePosition}%`,
            height: `${minHandlePosition - maxHandlePosition}%`
          }"
        >
          <div class="slider-segment"></div>
        </div>
      </div>
      
      <div class="handles-container">
        <div 
          class="slider-handle max-handle"
          :style="{ top: `${maxHandlePosition}%` }"
          @mousedown="startDrag($event, 'max')"
        >
          <div class="handle-circle">
            <div class="handle-line"></div>
            <div class="handle-tooltip">{{ formatDate(maxValue) }}</div>
          </div>
        </div>
        
        <div 
          class="slider-handle min-handle"
          :style="{ top: `${minHandlePosition}%` }"
          @mousedown="startDrag($event, 'min')"
        >
          <div class="handle-circle">
            <div class="handle-line"></div>
            <div class="handle-tooltip">{{ formatDate(minValue) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangeSlider',
  data() {
    return {
      minValue: new Date('2019-01-01'),
      maxValue: new Date(),
      isDragging: false,
      activeHandle: null
    }
  },
  computed: {
    absoluteMin() {
      return new Date('2019-01-01')
    },
    absoluteMax() {
      return new Date()
    },
    minHandlePosition() {
      return this.dateToPosition(this.minValue)
    },
    maxHandlePosition() {
      return this.dateToPosition(this.maxValue)
    },
    dateScaleTicks() {
      const count = 6
      const totalMonths = this.getMonthsDifference(this.absoluteMin, this.absoluteMax)
      return Array.from({ length: count }, (_, i) => {
        const date = new Date(this.absoluteMin)
        date.setMonth(date.getMonth() + Math.floor(totalMonths * (i / (count - 1))))
        return {
          value: date,
          position: 100 - (100 * (i / (count - 1)))
        }
      })
    }
  },
  methods: {
    startDrag(event, handle) {
      this.isDragging = true
      this.activeHandle = handle
      event.preventDefault()
    },
    handleDrag(event) {
      if (!this.isDragging) return

      const sliderRect = this.$refs.sliderBar.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100,
        ((event.clientY - sliderRect.top) / sliderRect.height) * 100
      ))
      
      const value = this.positionToDate(percentage)
      
      if (this.activeHandle === 'min') {
        this.minValue = value < this.maxValue ? value : this.minValue
      } else {
        this.maxValue = value > this.minValue ? value : this.maxValue
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
    dateToPosition(date) {
      const totalRange = this.absoluteMax - this.absoluteMin
      const currentPosition = date - this.absoluteMin
      return 100 - ((currentPosition / totalRange) * 100)
    },
    positionToDate(position) {
      const totalRange = this.absoluteMax - this.absoluteMin
      const value = this.absoluteMin.getTime() + ((100 - position) / 100) * totalRange
      return new Date(value)
    },
    formatDate(date) {
      return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      })
    },
    getMonthsDifference(date1, date2) {
      return (date2.getFullYear() - date1.getFullYear()) * 12 + 
             (date2.getMonth() - date1.getMonth())
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.handleDrag)
    window.addEventListener('mouseup', this.stopDrag)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.handleDrag)
    window.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style scoped>
.date-range-slider {
  position: absolute;
  left: 25px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 12px;
  width: 40px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  z-index: 1000;
}

.slider-container {
  position: relative;
  height: 300px;
  width: 1px;
  margin: 0;
}

.slider-bar-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 100%;
  border-radius: 10px;
  overflow: visible;
  background: var(--surface-ground);
  border: 1px solid #ccc;
}

.slider-bar-active {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.2;
}

.handle-circle {
  width: 14px;
  height: 14px;
  background: #000;
  border: 2px solid #000;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  position: relative;
}

.handle-line {
  position: absolute;
  left: 100%;
  top: 50%;
  width: 8px;
  height: 2px;
  background: #000;
  transform: translateY(-50%);
}

.slider-handle:hover .handle-circle {
  background: #333;
  border-color: #333;
  transform: scale(1.2);
}

.handle-tooltip {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #333;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  border: 1px solid #ddd;
}

.handle-tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: white;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.slider-handle:hover .handle-tooltip {
  opacity: 1;
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

.slider-handle {
  position: absolute;
  right: -20px;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 2;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  padding-right: 10px;
}
</style> 