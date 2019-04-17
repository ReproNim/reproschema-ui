<template>
  <div class="TimeRangeInput container ml-3 pl-3">
    <b-row>
      <b-col>
        <span>Bedtime</span>
        <h4>{{bedtime.format('hh:mm')}}
        <span v-if="startAM"> AM </span>
        <span v-else> PM </span>
        </h4>
      </b-col>
      <b-col>
        <span>Wake</span>
        <h4>{{waketime.format('hh:mm')}}
        <span v-if="endAM"> AM </span>
        <span v-else> PM </span>
        </h4>
      </b-col>
    </b-row>
    <svg :id="id">

    </svg>
    <div class="mt-3">
      <b-button>Submit</b-button>
    </div>
  </div>
</template>

<style>
  .circumference {
    fill: #fff;
    stroke: #f2f2f2;
    stroke-width: 10px;
  }

  .dot circle:hover {
    cursor: pointer;
  }

  .timeDotText:hover {
    cursor: pointer;
  }

  .dot circle {
    /* fill: lightsteelblue; */
    stroke: steelblue;
    stroke-width: 1.5px;
  }

  .dot circle.dragging {
    fill: steelblue;
    stroke: darkblue;
  }
</style>

<script>
import { event as currentEvent } from 'd3-selection';
import _ from 'lodash';
import moment from 'moment';

window.moment = moment;

const d3 = Object.assign({},
  require('d3-selection'),
  require('d3-drag'),
  require('d3-scale'),
  require('d3-time'),
  require('d3-shape'),
);

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
      arc12: null,
      prevVector: null,
      hourLabel: null,
      minLabel: null,
      startAM: false, // default bedtime is PM
      endAM: true, // default waketime is AM
      prevCoords: [],
      prevAngles: {},
      prevDelta: {},
      revolutions: 0,
      coords: [{
        x: -100,
        y: 0,
      },
      {
        x: 0,
        y: 100,
      }],
    };
  },
  computed: {
    startEndAngles() {
      return this.getStartEndAngles(this.coords);
    },
    drawArc12() {
      return d3.arc()
        .outerRadius(this.circumference_r + 2.5)
        .innerRadius(this.circumference_r - 2.5);
    },
    bedtime() {
      // const output = this.waketime.clone();
      // output
      //   .subtract(this.startEndAngles.diffRevTime.hour, 'hours')
      //   .subtract(this.startEndAngles.diffRevTime.minutes, 'minutes');

      // return output;
      const timeObj = this.timeToHourMin(this.startEndAngles.startTime);
      const hour = timeObj.hour;
      const minute = timeObj.minutes;
      return moment().hour(hour).minute(minute);
    },
    waketime() {
      const timeObj = this.timeToHourMin(this.startEndAngles.endTime);
      const hour = timeObj.hour;
      const minute = timeObj.minutes;
      return moment().hour(hour).minute(minute);
    },
  },
  methods: {
    angleToCoord(alpha, r) {
      const x = r * Math.sin(alpha);
      const y = -r * Math.cos(-alpha);
      return { x, y };
    },
    angleToTime(alpha) {
      // const today = new Date();
      // const yday = today.getDate() - 1;
      let xfm;
      if (alpha < 0) {
        xfm = d3.scaleLinear().domain([-Math.PI, 0]).range([6, 12]);
      } else {
        xfm = d3.scaleLinear().domain([0, Math.PI]).range([0, 6]);
      }
      return xfm(alpha);
    },
    timeToAngle(time) {
      // time is in terms of hours + seconds/3600
      let xfm;
      if (time > 6) {
        xfm = d3.scaleLinear().range([-Math.PI, 0]).domain([6, 12]);
      } else {
        xfm = d3.scaleLinear().range([0, Math.PI]).domain([0, 6]);
      }
      return xfm(time);
    },
    timeToHourMin(time) {
      // time is in hours and decimal places are seconds after the hour.
      const hour = Math.floor(time);
      const secondsFrac = time - hour;
      const minutes = Math.floor(secondsFrac * 60);
      return { hour, minutes };
    },
    hourMinToTime(hourObj) {
      return hourObj.hour + (hourObj.minutes / 60);
    },
    timeRangeToDateRange() {

    },
    dragstarted(elem) {
      currentEvent.sourceEvent.stopPropagation();
      d3.select(elem)
        .classed('dragging', true);
    },
    dragged(d, elem) {
      const prevAngles = { ...this.getStartEndAngles(this.coords) };
      const prevHour = prevAngles.diffTime.hour;

      // TODO: store the previous hours of the start and endtimes here
      const prevStartHour = this.timeToHourMin(prevAngles.startTime).hour;
      const prevEndHour = this.timeToHourMin(prevAngles.endTime).hour;

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

      const newStartEndAngles = this.startEndAngles;
      const newStartHour = this.timeToHourMin(newStartEndAngles.startTime).hour;
      const newEndHour = this.timeToHourMin(newStartEndAngles.endTime).hour;

      // TODO: check for a pass around 12 and calculate AM/PM
      if ((prevStartHour === 11 && newStartHour === 0)
        || (prevStartHour === 0 && newStartHour === 11)) {
        this.startAM = !this.startAM;
      }

      if ((prevEndHour === 11 && newEndHour === 0)
        || (prevEndHour === 0 && newEndHour === 11)) {
        this.endAM = !this.endAM;
      }

      // look for an overlap here.
      if (prevHour === 11 && newStartEndAngles.diffTime.hour === 0) {
        this.revolutions = this.revolutions ? 0 : 1;
      } else if (prevHour === 0 && newStartEndAngles.diffTime.hour === 11) {
        this.revolutions = this.revolutions ? 0 : 1;
      }

      // eslint-disable-next-line
      d3.select(elem)
        .attr('cx', newX)
        .attr('x', newX)
        // eslint-disable-next-line
        .attr('cy', newY)
        .attr('y', newY);

      this.arc12
        .data([newStartEndAngles])
        .attr('d', da => this.drawArc12(da))
        .attr('class', 'arc12')
        .style('fill', 'steelblue');

      this.hourLabel
        .text(`${newStartEndAngles.diffRevTime.hour}`);

      this.minLabel
        .text(`${newStartEndAngles.diffRevTime.minutes}`);
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
        .on('start', function foo() { self.dragstarted(this); })
        .on('drag', function dragged(d) { self.dragged(d, this); })
        .on('end', function end(d) { self.dragended(d, this); });

      // the arc

      const drawArc12 = d3.arc()
        .outerRadius(this.circumference_r + 2.5)
        .innerRadius(this.circumference_r - 2.5);

      const arc12 = container.selectAll('.arc12')
        .data([this.startEndAngles])
        .attr('class', 'arc12')
        .enter()
        .append('path');

      this.arc12 = arc12;

      arc12.attr('d', da => drawArc12(da))
        .attr('class', 'arc12')
        .style('fill', 'steelblue');

      const colors = ['green', 'orange'];

      // center time difference label

      const diff = this.startEndAngles.diffRevTime;

      const timeGroup = container.selectAll('.timeLabelGroup')
        .data([diff])
        .enter()
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('class', 'timeLabelGroup');

      const foo = timeGroup
        .append('tspan')
        .style('font-size', '34px');

      foo
        .attr('class', 'hourLabel')
        .attr('dy', '.35em')
        .text(`${diff.hour}`);

      timeGroup
        .append('tspan')
        .text('hr');

      const bar = timeGroup
        .append('tspan')
        .attr('dx', '0.25em')
        .style('font-size', '24px');

      bar
        .attr('class', 'minLabel')
        .text(`${diff.minutes}`);

      this.hourLabel = foo;
      this.minLabel = bar;

      timeGroup
        .append('tspan')
        .text('min');


      /*
        Now lets do the clock face labels.
      */

      const hourTimes = _.map([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        t => this.hourMinToTime({ hour: t, minutes: 0 }));
      const hourAngles = _.map(hourTimes, t => this.timeToAngle(t));
      const hourCoords = _.map(hourAngles, a => this.angleToCoord(a, this.circumference_r * 0.8));

      container.selectAll('.clockLabel')
        .data(hourCoords)
        .enter()
        .append('text')
        .attr('class', 'clockLabel')
        .attr('text-anchor', 'middle')
        .attr('fill', '#404040')
        .attr('alignment-baseline', 'middle')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text((d, i) => i + 1);


      // container.selectAll('.timeDotText')
      //   .data(this.coords)
      //   .enter()
      //   .append('text')
      //   .attr('x', d => d.x)
      //   .attr('y', d => d.y)
      //   .attr('text-anchor', 'middle')
      //   .attr('class', 'timeDotText')
      //   .text((d, i) => {
      //     const emoji = [String.fromCodePoint(0x1F354), String.fromCodePoint(0x1F354)];
      //     return emoji[i];
      //   })
      //   .attr('dy', '0.35em')
      //   .style('font-size', '24px')
      //   .call(drag);

      //  here are the markers
      // this.container = container.append('g')
      //   .attr('class', 'dot')
      //   .selectAll('circle')
      //   .data(this.coords)
      //   .enter()
      //   .append('circle')
      //   .attr('class', 'timeDot')
      //   .attr('r', 10)
      //   .attr('cx', d => d.x)
      //   .attr('cy', d => d.y)
      //   .attr('fill', (d, i) => colors[i])
      //   .call(drag);

      this.container = container.selectAll('.timeDotText')
        .data(this.coords)
        .enter()
        .append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('class', 'timeDotText')
        .text((d, i) => {
          const emoji = [String.fromCodePoint(0x1F318), String.fromCodePoint(0x1F31E)];
          return emoji[i];
        })
        .attr('dy', '0.35em')
        .style('font-size', '28px')
        .call(drag);
    },
    sendData(val) {
      this.$emit('valueChanged', val);
    },
    getStartEndAngles(coords) {
      let startAngle = Math.atan2(coords[0].x, -coords[0].y);
      let endAngle = Math.atan2(coords[1].x, -coords[1].y);

      const originalStart = startAngle;
      const originalEnd = endAngle;
      // endAngle = endAngle < 0 ? endAngle + (Math.PI * 2) : endAngle;
      // startAngle = startAngle < 0 ? startAngle + (Math.PI * 2) : startAngle;

      if (startAngle < 0 && endAngle < 0) {
        if (startAngle > endAngle) {
          // const tmp = endAngle;
          endAngle += (Math.PI * 2); // startAngle;
          // startAngle = tmp;
        }
      } else if (startAngle > 0 && endAngle > 0) {
        if (startAngle > endAngle) {
          startAngle -= Math.PI * 2;
        }
      } else if (startAngle >= 0 && endAngle < 0) {
        endAngle += (Math.PI * 2);
      }
      // startAngle = startAngle < 0 ? startAngle + Math.PI * 2 : startAngle;
      // const startAngle = Math.PI;
      // const endAngle = Math.PI / 2;
      const startTime = this.angleToTime(originalStart);
      const endTime = this.angleToTime(originalEnd);
      let diff = endTime - startTime;
      if (diff < 0) {
        diff += 12;
      }
      const diffTime = this.timeToHourMin(diff);
      const diffRevTime = { ...diffTime };
      if (this.revolutions) {
        diffRevTime.hour += 12;
      }

      return {
        startAngle,
        endAngle,
        padAngle: 0,
        startTime,
        endTime,
        diffTime,
        diffRevTime,
      };
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
