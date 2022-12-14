import {get_goals, get_packages, get_sections} from "./data.js";

const store = PetiteVue.reactive({
  $delimiters: ["${", "}"],
  sections: [],
  goals: [],
  packages: [],
  collected: 0,
  total: 0,
  percent: 0,
  selectedSection: null,
  date: new Date(),

  refresh() {
    Promise.all([
      get_goals(),
      get_packages(),
      get_sections(),
    ]).then(([goals, packages, sections]) => {
      this.sections = sections;
      this.goals = this.calculateData(goals, false);
      this.packages = this.calculateData(packages, true);
      let totalIdx = this.sections.find((value) => value.name === 'Sektionen Total').id
      this.selectedSection = totalIdx;
      this.total = this.goals['amounts'][totalIdx].at(-1)
      this.collected = this.packages['amounts'][totalIdx].at(-1);
      this.percent = Math.round(this.collected / this.total * 1000) / 10;
      this.plotProgress();
    });
  },


  calculateData(iter, sum) {
    let amounts = {};
    let dates = {}
    iter.forEach((element) => {
      if (!amounts[element.section_id]) {
        amounts[element.section_id] = [element.amount]
        dates[element.section_id] = [new Date(element.date)]
      } else {
        amounts[element.section_id].push(element.amount + (sum ? amounts[element.section_id].at(-1) : 0))
        dates[element.section_id].push(new Date(element.date))
      }
    })
    this.sections.forEach((section) => {
      if (!amounts[section.id]) {
        amounts[section.id] = [0];
        dates[section.id] = [new Date()];
      }
    })
    return {amounts, dates}
  },

  totalGoal(id) {
    return this.goals['amounts'][id].at(-1);
  },

  getGoal(id) {
    let goals = this.goals['dates'][id];
    let amounts = this.goals['amounts'][id];
    let idx = goals.findIndex((elem) => elem > new Date());
    if (idx == -1) {
      return amounts.at(-1);
    } else if (idx == 0) {
      return 0;
    } else {
      let today = new Date();
      let a = goals[idx - 1];
      let b = goals[idx];
      return Math.round((amounts.at(idx - 1) * (1 - (today - a) / (b - a))) + (amounts.at(idx) * (1 - (b - today) / (b - a))));
    }
  },

  plotProgress() {
    let trace_goals = {
      y: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => section.name).reverse(),
      x: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => this.getGoal(section.id)).reverse(),
      orientation: 'h',
      name: `Ziel (heute)`,
      type: "bar",
    }
    let next_goals = {
      y: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => section.name).reverse(),
      x: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => this.totalGoal(section.id)).reverse(),
      orientation: 'h',
      name: `Quote`,
      type: "bar",
    }
    let trace_packages = {
      y: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => section.name).reverse(),
      x: this.sections.filter((value) => value.name !== 'Sektionen Total').map((section) => this.packages['amounts'][section.id].at(-1)).reverse(),
      orientation: 'h',
      type: "bar",
      name: "Sammelstand",
    }

    Plotly.newPlot(
      'progressPlot',
      [trace_packages, trace_goals, next_goals].reverse(),
      {barmode: 'group', height: "900", title: "Sammelstand", xaxis: {automargin: true}, yaxis: {automargin: true}},
    );
  },

  plotSection(id) {
    let goal_trace = {
      x: this.goals['dates'][this.selectedSection],
      y: this.goals['amounts'][this.selectedSection],
      name: "Ziel",
      type: 'scatter',
    }
    let package_trace = {
      x: this.packages['dates'][this.selectedSection],
      y: this.packages['amounts'][this.selectedSection],
      name: "Gesammelt",
      type: 'scatter',
    }
    Plotly.newPlot('sectionPlot', [goal_trace, package_trace], {'title': this.sectionName(this.selectedSection), 'height': 620})
  },


  sectionName(id) {
    return this.sections.find(element => element.id == id).name
  },


});

store.refresh();

PetiteVue.createApp(store).mount();
