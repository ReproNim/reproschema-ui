<template>
    <div>
        <div v-if="statusType !== 'expired'">
            <div class="day">
                <span class="number">{{ days }}</span>
                <div class="format">{{ wordString.day }}</div>
            </div>
            <div class="hour">
                <span class="number">{{ hours }}</span>
                <div class="format">{{ wordString.hours }}</div>
            </div>
            <div class="min">
                <span class="number">{{ minutes }}</span>
                <div class="format">{{ wordString.minutes }}</div>
            </div>
            <div class="sec">
                <span class="number">{{ seconds }}</span>
                <div class="format">{{ wordString.seconds }}</div>
            </div>
        </div>
        <div class="message" :class="statusType">{{ message }}</div>
<!--        <div class="status-tag" :class="statusType">{{ statusText }}</div>-->
    </div>
</template>

<script>
    import config from '../../config';
    export default {
        name: 'Timer',
        props: {
            'starttime': {},
            'endtime': {},
            'trans': {}
        },
        data() {
            return {
                timer:"",
                wordString: {},
                start: "",
                end: "",
                interval: "",
                days:"",
                minutes:"",
                hours:"",
                seconds:"",
                message:"",
                statusType: ""

            };
        },
        created: function () {
            this.wordString = JSON.parse(this.trans);
        },
        methods: {
            timerCount(start,end){
                // Get todays date and time
                var now = new Date().getTime();
                // Find the distance between now an the count down date
                var distance = start - now;
                var passTime =  end - now;
                // console.log(69, distance, end, passTime);
                if(distance < 0 && passTime < 0){
                    // this.message = this.wordString.expired;
                    this.message = `${this.timeoutMessage} ${config.contact}`;
                    this.statusType = "expired";
                    // this.statusText = this.wordString.status.expired;
                    clearInterval(this.interval);
                    return;

                }else if(distance < 0 && passTime > 0){
                    this.calcTime(passTime);
                    this.message = this.wordString.running;
                    this.statusType = "running";
                    // this.statusText = this.wordString.status.running;

                } else if( distance > 0 && passTime > 0 ){
                    console.log(84);
                    this.calcTime(distance);
                    this.message = this.wordString.upcoming;
                    this.statusType = "upcoming";
                    // this.statusText = this.wordString.status.upcoming;
                }
            },
            calcTime: function(dist){
                // Time calculations for days, hours, minutes and seconds
                this.days = Math.floor(dist / (1000 * 60 * 60 * 24));
                this.hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                this.seconds = Math.floor((dist % (1000 * 60)) / 1000);
            }

        },
        computed: {
            timeoutMessage() {
                return this.$t('timeout-message');
            },
        },
        mounted(){
            this.start = new Date(this.starttime).getTime();
            this.end = new Date(this.endtime).getTime();
            // Update the count down every 1 second
            this.timerCount(this.start,this.end);
            this.interval = setInterval(() => {
                this.timerCount(this.start,this.end);
            }, 1000);
        },
    };

</script>

<style scoped>
    .timer {
        font-size: 20px;
        color: #fff;
        text-align: center;
        margin-top: 50px;
    }
    .timer .day, .timer .hour, .timer .min, .timer .sec {
        font-size: 30px;
        display: inline-block;
        font-weight: 500;
        text-align: center;
        margin: 0 5px;
    }
    .timer .day .format, .timer .hour .format, .timer .min .format, .timer .sec .format {
        font-weight: 300;
        font-size: 14px;
        opacity: 0.8;
        width: 60px;
    }
    .timer .number {
        background: rgba(51, 51, 51, 0.53);
        padding: 0 5px;
        border-radius: 5px;
        display: inline-block;
        width: 60px;
        text-align: center;
    }
    .timer .message {
        font-size: 20px;
        font-weight: 500;
        margin-top: 5px;
        text-align: center;
    }
    .timer .status-tag {
        width: 270px;
        margin: 10px auto;
        padding: 8px 0;
        font-weight: 500;
        color: #000;
        text-align: center;
        border-radius: 15px;
    }
    .timer .status-tag.upcoming {
        background-color: lightGreen;
    }
    .timer .status-tag.running {
        background-color: gold;
    }
    .timer .status-tag.expired {
        background-color: silver;
    }
    .timer .message.expired {
        color: #cc0909;
    }
</style>
