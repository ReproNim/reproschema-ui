<template>
  <div class="TimeRangeInput container ml-3 pl-3">

    <svg :id="id">

    </svg>
    <div>
      <b-button>Submit</b-button>
    </div>
  </div>
</template>

<style>
  .circumference {
    fill: #fff;
    stroke: #f2f2f2;
    stroke-width: 5px;
  }

  .dot circle:hover {
    cursor: pointer;
  }

  .dot circle {
    fill: lightsteelblue;
    stroke: steelblue;
    stroke-width: 1.5px;
  }

  .dot circle.dragging {
    fill: red;
    stroke: brown;
  }
</style>

<script>
import { event as currentEvent } from 'd3-selection';

const d3 = Object.assign({}, require('d3-selection'), require('d3-drag'), require('d3-scale'), require('d3-time'));

window.d3 = d3;

// import _ from 'lodash';
// import { bus } from '../../main';


export default {
  name: 'timeRangeInput',
  props: ['constraints', 'init', 'selected_language', 'id'],
  data() {
    return {
      selected: null,
      width: 250,
      height: 250,
      circumference_r: 100,
      container: null,
      coords: [{
        x: 0,
        y: -100,
      },
      {
        x: 0,
        y: 100,
      }],
    };
  },
  computed: {
    timeTransform() {
      const today = new Date();
      const yday = today.getDate() - 1;
      return d3.scaleTime()
        .domain([yday, today])
        .range([0, 2 * Math.PI]);
    },
  },
  methods: {
    dragstarted(elem) {
      currentEvent.sourceEvent.stopPropagation();
      d3.select(elem)
        .classed('dragging', true);
    },
    dragged(d, elem) {
      // eslint-disable-next-line
      const d_from_origin = Math.sqrt((currentEvent.x ** 2) + (currentEvent.y ** 2));

      // eslint-disable-next-line
      const alpha = Math.acos(currentEvent.x / d_from_origin);

      const newX = this.circumference_r * Math.cos(alpha);

      // eslint-disable-next-line
      const newY = currentEvent.y < 0 ? -this.circumference_r * Math.sin(alpha) : this.circumference_r * Math.sin(alpha);

      // eslint-disable-next-line
      d.x = newX;
      // eslint-disable-next-line
      d.y = newY;

      this.coords = this.container.data();

      // eslint-disable-next-line
      d3.select(elem)
        .attr('cx', newX)
        // eslint-disable-next-line
        .attr('cy', newY);
    },
    dragended(d, elem) {
      d3.select(elem)
        .classed('dragging', false);
    },
    initialize() {
      const svg = d3.select(`#${this.id}`)
        .attr('width', this.width)
        .attr('height', this.height)
        .append('g')
        .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
      const container = svg.append('g');
      container.append('circle')
        .attr('r', this.circumference_r)
        .attr('class', 'circumference');

      const self = this;
      const drag = d3.drag()
        // .origin(d => d)
        .on('start', function foo() { self.dragstarted(this); })
        .on('drag', function dragged(d) { self.dragged(d, this); })
        .on('end', function end(d) { self.dragended(d, this); });

      this.container = container.append('g')
        .attr('class', 'dot start')
        .selectAll('circle')
        .data(this.coords)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .call(drag);
    },
    sendData(val) {
      this.$emit('valueChanged', val);
    },
  },
  watch: {
    init: {
      handler() {
        if (this.init != null) {
          this.selected = this.init.value;
        } else {
          this.selected = false;
        }
      },
      deep: true, // this watches all of the changes within an object. init: {value: 1}  not init: 1
    },
  },
  mounted() {
    if (this.init !== undefined || this.init != null) {
      this.selected = this.init;
    }
    this.initialize();
  },
};

// init --> selected; on radio button change emit(valueChanged) -->
// (in the parent, sets init) --> init has changed
// so then change this.selected = this.init
</script>
