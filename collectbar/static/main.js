import {get_goals, get_packages, get_sections} from "./data.js";

const store = PetiteVue.reactive({
  $delimiters: ["${", "}"],
  sections: [],
  goals: [],
  packages: [],
  selectedSection: null,
  date: new Date(),

  refresh() {
    Promise.all([
      get_goals(),
      get_packages(),
      get_sections(),
    ]).then(([goals, packages, sections]) => {
      this.sections = sections;
      this.selectedSection = sections[0].id;
      this.goals = this.calculateData(goals, false);
      this.packages = this.calculateData(packages, true);
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

  nextGoal(id) {
    let goals = this.goals['dates'][id];
    let amounts = this.goals['amounts'][id];
    let idx = goals.findIndex((elem) => elem > new Date());

    return amounts.at(idx);

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
      console.log('b-a = ', b - a)
      console.log('y_0 = ', amounts.at(idx - 1))
      console.log('y_1 = ', amounts.at(idx))
      console.log('dx', today - a)
      console.log('dx', b - today)
      return Math.round((amounts.at(idx - 1) * (1 - (today - a) / (b - a))) + (amounts.at(idx) * (1 - (b - today) / (b - a))));
    }
  },

  plotProgress() {
    let trace_goals = {
      y: this.sections.map((section) => section.name),
      x: this.sections.map((section) => this.getGoal(section.id)),
      orientation: 'h',
      name: `Ziel (heute)`,
      type: "bar",
    }
    let next_goals = {
      y: this.sections.map((section) => section.name),
      x: this.sections.map((section) => this.nextGoal(section.id)),
      orientation: 'h',
      name: `Nächstes Ziel`,
      type: "bar",
    }
    let trace_packages = {
      y: this.sections.map((section) => section.name),
      x: this.sections.map((section) => this.packages['amounts'][section.id].at(-1)),
      orientation: 'h',
      type: "bar",
      name: "Sammelstand",
    }

    Plotly.newPlot(
      'progressPlot',
      [trace_packages, trace_goals, next_goals].reverse(),
      {barmode: 'group', height: "900", title: "Sammelstand"},
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
