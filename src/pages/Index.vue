<template>
  <q-page class="row items-center justify-evenly">
    <q-card>
      <q-card-section>
        <q-toggle label="Asin(Bx+C)" v-model="fnSin" @input="selectFunction('SIN')" />
        <q-toggle label="Acos(Bx+C)" v-model="fnCos" @input="selectFunction('COS')" />
        <q-toggle label="A(Bx+C)^2 + D" v-model="fnSquare" @input="selectFunction('SQUARE')" />
        <q-toggle label="Alog(Bx + C) + D" v-model="fnLog" @input="selectFunction('LOG')" />
        <q-toggle label="A*SQRT(Bx + C) + D" v-model="fnRoot" @input="selectFunction('ROOT')" />
      </q-card-section>

      <q-separator dark />

      <q-card-section>
        <q-input filled v-model="step" label="Step" type="number" />
        <q-input filled v-model="minX" label="Min X" type="number" />
        <q-input filled v-model="maxX" label="Max X" type="number" />
        <q-input filled v-model="minY" label="Min Y" type="number" />
        <q-input filled v-model="maxY" label="Max Y" type="number" />
      </q-card-section>

      <q-card-section>
        <q-input filled v-model="paramA" label="A" type="number" />
        <q-input filled v-model="paramB" label="B" type="number" />
        <q-input filled v-model="paramC" label="C" type="number" />
        <q-input filled v-model="paramD" label="D" type="number" />
      </q-card-section>

      <q-card-actions>
        <a :href="image" download="plot.png" class="fit">
          <q-btn class="fit" label="Save" color="primary"/>
        </a>
      </q-card-actions>

    </q-card>
    <q-card>
      <q-card-section>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

import electron from 'electron'

interface Dot{
  x: number,
  y: number
}

@Component({})
export default class PageIndex extends Vue {
  step = 0.1

  canvasWidth = 500
  canvasHeight = 500

  fnSin = true
  fnCos = false
  fnSquare = false
  fnLog = false
  fnRoot = false
  fnCustom = false

  customFunction = ''

  minX = -10
  maxX = 10
  minY = -10
  maxY = 10

  paramA = 0
  paramB = 0
  paramC = 0
  paramD = 0

  vueCanvas = undefined as CanvasRenderingContext2D | undefined

  image = ""

  deselectFunctions() {
    this.fnSin = false
    this.fnCos = false
    this.fnSquare = false
    this.fnLog = false
    this.fnRoot = false
    this.fnCustom = false
  }

  selectFunction(func: string) {
    this.deselectFunctions()
    switch (func) {
      case 'SIN':
        this.fnSin = true;
        break;
      case 'COS':
        this.fnCos = true;
        break;
      case 'SQUARE':
        this.fnSquare = true;
        break;
      case 'LOG':
        this.fnLog = true;
        break;
      case 'ROOT':
        this.fnRoot = true;
        break;
      default:
        this.fnCustom = true;
        break;
    }

    this.drawFunction()
  }

  getFunction() {
    if (this.fnSin == true) return (x: number) => this.paramA*Math.sin(this.paramB*x + this.paramC)
    if (this.fnCos == true) return (x: number) => this.paramA*Math.cos(this.paramB*x + this.paramC)
    if (this.fnSquare == true) return (x: number) => this.paramA*Math.pow(this.paramB*x + this.paramC, 2) + this.paramD
    if (this.fnLog == true) return (x: number) => this.paramA*Math.log(this.paramB*x + this.paramC) + this.paramD
    if (this.fnRoot == true) return (x: number) => this.paramA*Math.sqrt(this.paramB*x + this.paramC) + this.paramD

    if (this.fnCustom == true) return Math.sin

    return Math.sin
  }

  toXCanvasCoordinates(x: number): number {
    const sizeX = this.maxX - this.minX
    return (x - this.minX)/sizeX*this.canvasWidth;
  }

  toYCanvasCoordinates(y: number): number {
    const sizeY = this.maxY - this.minY
    return Math.abs((y - this.minY)/sizeY*this.canvasHeight - this.canvasHeight)
  }

  generateDots(): Dot[] {
    const func = this.getFunction()
    let dots = [] as Dot[]
    for(let x = this.minX; x <= this.maxX; x += this.step) {
      const y = func(x)
      dots.push({x,y})
    }

    dots = dots.filter(item => item.x >= this.minX && item.x <= this.maxX && item.y >= this.minY && item.y <= this.maxY)

    const sizeX = this.maxX - this.minX
    const sizeY = this.maxY - this.minY
    dots = dots.map((item: Dot) => {
      return {
        x: this.toXCanvasCoordinates(item.x),
        y: this.toYCanvasCoordinates(item.y),
      }
    })

    dots = dots.filter(item => item.x >= 0 && item.x <= this.canvasWidth && item.y >= 0 && item.y <= this.canvasHeight)

    return dots
  }

  drawField() {
    if (this.vueCanvas !== undefined) {
      if(this.minX < 0 && this.maxX > 0) {
        this.vueCanvas?.beginPath();
        this.vueCanvas.strokeStyle = "green";
        const x = this.toXCanvasCoordinates(0)
        this.vueCanvas?.moveTo(x, 0);
        this.vueCanvas?.lineTo(x, this.canvasHeight);
        this.vueCanvas?.stroke()

        this.vueCanvas.strokeStyle = "black";
        for(let i = 0; i <= 10; i++) {
          const shift = Math.round(((this.maxY - this.minY)/10*i)*100) / 100
          if(-shift >= this.minY && -shift <= this.maxY)
            this.vueCanvas?.fillText(shift.toString(), x + 3, this.toYCanvasCoordinates(-shift) - 2);
          if(shift >= this.minY && shift <= this.maxY)
            this.vueCanvas?.fillText(shift.toString(), x + 3, this.toYCanvasCoordinates(shift) - 2);
        }
      }

      if(this.minY < 0 && this.maxY > 0) {
        this.vueCanvas?.beginPath();
        this.vueCanvas.strokeStyle = "green";
        const y = this.toYCanvasCoordinates(0)
        this.vueCanvas?.moveTo(0, y);
        this.vueCanvas?.lineTo(this.canvasWidth, y);
        this.vueCanvas?.stroke()

        this.vueCanvas.strokeStyle = "black";
        for(let i = 0; i <= 10; i++) {
          const shift = Math.round(((this.maxX - this.minX)/10*i)*100) / 100
          if(-shift >= this.minX && -shift <= this.maxX)
          this.vueCanvas?.fillText(shift.toString(), this.toXCanvasCoordinates(-shift) + 3, y - 2);
          if(shift >= this.minX && shift <= this.maxX)
          this.vueCanvas?.fillText(shift.toString(), this.toXCanvasCoordinates(shift) + 3, y - 2);
        }
      }
    }
  }

  @Watch('minX')
  @Watch('maxX')
  @Watch('minY')
  @Watch('maxY')
  @Watch('step')
  @Watch('paramA')
  @Watch('paramB')
  @Watch('paramC')
  @Watch('paramD')
  drawFunction() {
    this.minX = Number(this.minX)
    this.maxX = Number(this.maxX)
    this.minY = Number(this.minY)
    this.maxY = Number(this.maxY)
    this.step = Number(this.step)
    if (this.step < 0.001) this.step = 0.001

    if (this.maxX <= this.minX) this.maxX = this.minX + 1
    if (this.maxY <= this.minY) this.maxY = this.minY + 1

    this.paramA = Number(this.paramA)
    this.paramB = Number(this.paramB)
    this.paramC = Number(this.paramC)
    this.paramD = Number(this.paramD)

    this.vueCanvas?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawField()
    
    const dots = this.generateDots()
    if (dots.length > 0) {
      this.vueCanvas?.beginPath();
      this.vueCanvas?.moveTo(dots[0].x, dots[0].y);
      for(const dot of dots)
        this.vueCanvas?.lineTo(dot.x, dot.y);
      this.vueCanvas?.stroke()
    }

    document.getElementById("canvas").toBlob(this.generateImage);
  }

  async generateImage(image: Blob) {
    const readData = () => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(image);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    const data = await readData()
    console.log(data)
    this.image = URL.createObjectURL(image)
  }

  mounted() {
    const c = document.getElementById("canvas") as HTMLElement
    const ctx = c.getContext("2d") as CanvasRenderingContext2D    
    this.vueCanvas = ctx;

    this.drawFunction()
  }
}
</script>
