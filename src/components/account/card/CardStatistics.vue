<template>
    <AccountHeader :prop_title=title />
  
    <div class="chart-space">
      <Bar style="width: 90%; height: auto;"
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
      />
    </div>
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import { Bar } from 'vue-chartjs';
    import { Chart, registerables } from 'chart.js';
    Chart.register(...registerables);import AccountHeader from '../common/AccountHeader.vue';
  
    const title = ref('결재내역 통계');
  
    // chart
    const chartData = ref(
      {
        'labels': [ '식비', '유류비', '여가', '통신비', '공과금', '잡화', '보험비' ],
        'datasets': [
          { data: [800000, 400000, 340500, 130200, 84000, 485900, 299000],
            label: '10월',
            borderWidth: 2
          },
          { data: [769000, 500000, 240000, 374800, 112900, 39470, 758000],
            label: '9월',
            borderWidth: 2
          },
          { data: [769000, 500000, 240000, 374800, 112900, 39470, 758000],
            label: '8월',
            borderWidth: 2
          },
          { data: [769000, 500000, 240000, 374800, 112900, 39470, 758000],
            label: '7월',
            borderWidth: 2
          }
        ]
      }
    );

    const chartOptions = ref(
      {
        'responsive': true
      }
    )
  </script>
  
  <style>
  
  </style>