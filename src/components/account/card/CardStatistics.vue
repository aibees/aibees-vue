<template>
    <AccountHeader :prop_title=title />
    <div class="month">
      <div class="month-label">
        조회년월
      </div>
      <div class="month-text">
        <input id="month-input" type="month" />
      </div>
      <div class="month-button">
        <button @click="getChartData()">조회</button>
      </div>
    </div>
    <div style="display: flex; justify-content: center; flex-direction: left; flex-wrap: wrap; margin: auto">
      <div v-for="(data, k, idx) in chartData" :key="idx" style="width: 300px; height: auto;">
        <div class="chart_title">{{ k }}</div>
        <Doughnut :id="`usageDoughnut_`+idx" :data="data" :options="chartOptions" />
      </div>
    </div>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue'
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import { Doughnut } from 'vue-chartjs';
    // import chartjsPluginDoughnutlabel from "chartjs-plugin-doughnutlabel";
    import chartjsPluginDatalabels from "chartjs-plugin-datalabels";
    import { Chart, registerables } from 'chart.js';

    import AccountHeader from '../common/AccountHeader.vue';
  
    // don't forget to use register
    Chart.register(...registerables, chartjsPluginDatalabels);
    
    
    const title = ref('카드/구분별 월 카드결제금액');
    const chartData = ref({});

    onMounted(() => {
      // default input value
      const today = new Date();
      const toMonth = (today.getMonth()+1 < 10 ? '0' : '') + (today.getMonth()+1);

      document.getElementById('month-input').value = today.getFullYear() + '-' + toMonth;

      getChartData();
    })

    const chartOptions = ref(
      {
        responsive : true,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            align: 'center',
            display: true,
            formatter: function(value, context) {
              var idx = context.dataIndex;
              return context.chart.data.labels[idx] + '\n' + addComma(value);
            },
            font: {
              weight: 'bold'
            }
          }
        }
      }
    )

    // custom Function
    const getChartData = () => {
      const ym = document.getElementById('month-input').value.replace('-', '');
      const url = aibeesGlobal.API_SERVER_URL + '/statics/doughnut?ym=' + ym;
      const callback = (res) => {
          chartData.value = res.data;
      }
      axiosGet(url, callback);
    }

    function addComma(x) {
      x = x.toString();
      var pattern = /(-?\d+)(\d{3})/;
      while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
      return x;
    }
  </script>
  
  <style lang="scss" scoped>
  .month {
    margin: auto;
    width: 300px;
    height: 30px;
    display: flex;
    background-color: rgb(245, 245, 245);
    border-radius: 5px;

    .month-label {
      width: 100px;
      height: 30px;
    }

    .month-text {
      width: 150px;
      height: 30px;
      border-left: 1px solid black;

      #month-input {
        width: 100%;
        height: 30px;
        background-color: white;
        border: none;
      }
    }

    .month-button {
      width: 50px;
      height: 30px;
    }
  }

  .chart_title {
    margin: 10px auto;
    font-size: 14px;
    font-weight: 750;
  }
  </style>