import fetch from 'node-fetch';
import { getWeek } from '../utils/dateUtils.js';

const BASE_URL = process.env.VIKUNJA_BASE_URL;
const TOKEN = process.env.VIKUNJA_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Vikunja error ${res.status}: ${errorBody}`);
  }

  return {
    data: await res.json(),
    headers: res.headers
  };
}

export async function getMetricsSummary() {
  let allTasks = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const { data, headers: resHeaders } = await get(`/tasks/all?page=${currentPage}`);
    allTasks = allTasks.concat(data);

    const totalPagesHeader = resHeaders.get('x-pagination-total-pages');
    totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
    currentPage++;
  } while (currentPage <= totalPages);

  const tasks = allTasks;
  const completed = tasks.filter(t => t.done && t.done_at);

  const durations = completed.map(t => {
    const start = new Date(t.created);
    const end = new Date(t.done_at);
    return (end - start) / (1000 * 60 * 60);
  });

  const avgCompletionHours =
    durations.reduce((a, b) => a + b, 0) / (durations.length || 1);

  const tasksPerWeek = {};
  const completedPerWeek = {};

  tasks.forEach(t => {
    const week = getWeek(t.created);
    const year = new Date(t.created).getFullYear();
    const key = `${year}-W${week}`;
    tasksPerWeek[key] = (tasksPerWeek[key] || 0) + 1;
  });

  completed.forEach(t => {
    const week = getWeek(t.done_at);
    const year = new Date(t.done_at).getFullYear();
    const key = `${year}-W${week}`;
    completedPerWeek[key] = (completedPerWeek[key] || 0) + 1;
  });

  const eventoTasks = tasks.filter(t =>
    t.labels?.some(label => label.title === 'EVENTO')
  );

  return {
    totalTasks: tasks.length,
    avgCompletionHours: Number(avgCompletionHours.toFixed(2)),
    tasksPerWeek,
    completedPerWeek,
    eventoTasks: eventoTasks.length
  };
}
