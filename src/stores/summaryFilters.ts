import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useSummaryFiltersStore=defineStore('summary-filters',()=>{const period=ref<'7'|'30'|'90'|'custom'>('30'),from=ref(''),to=ref(''),type=ref<'all'|'weights'|'cardio'>('all'),exerciseId=ref('');return{period,from,to,type,exerciseId}})
