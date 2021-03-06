(function() {
  'use strict';

  angular.module('nightwatch')
    .controller('WatcherTriggerCtrl', WatcherTriggerCtrl);

    WatcherTriggerCtrl.$inject = ['$scope', '$state', 'watchers', 'ScheduleTriggerTypes', 'triggersData', 'editable'];

    function WatcherTriggerCtrl($scope, $state, watchers, ScheduleTriggerTypes, triggersData, editable) {
      var watcherTriggerVM = this;

      watcherTriggerVM.type = (_.keys(triggersData.schedule)[0]) || '';
      watcherTriggerVM.schedule = {};
      watcherTriggerVM.hours = [];
      watcherTriggerVM.dailyData = { times: [], hours: [], minutes: [] };
      watcherTriggerVM.dailyTimes = watcherTriggerVM.weeklyTimes = watcherTriggerVM.monthlyTimes = watcherTriggerVM.yearlyTimes = true;;
      watcherTriggerVM.weeklyData = { times: [], days: [], hours: [] };
      watcherTriggerVM.monthlyData = { times: [], days: [], hours: [] };
      watcherTriggerVM.yearlyData = { times: [], months: [], days: [], hours: [] };

      watcherTriggerVM.goToInput = goToInput;
      watcherTriggerVM.goToConditions = goToConditions;
      watcherTriggerVM.saveTrigger = saveTrigger;
      watcherTriggerVM.canBeEdit = editable;

      watcherTriggerVM.getTriggerTypes = getTriggerTypes;

      loadData(triggersData);

      function goToInput() {
        watcherTriggerVM.saveTrigger();
        $state.go('watch.watchers.create.input');
      }

      function goToConditions() {
        watcherTriggerVM.saveTrigger();
        $state.go('watch.watchers.create.conditions');
      }

      function saveTrigger() {
        if (watcherTriggerVM.type === ScheduleTriggerTypes.HOURLY) {
          watcherTriggerVM.schedule.hourly = watcherTriggerVM.hours;
        }
        else if (watcherTriggerVM.type === ScheduleTriggerTypes.DAILY) {
          if (watcherTriggerVM.dailyTimes) {
            watcherTriggerVM.schedule.daily = { at: watcherTriggerVM.dailyData.times };
          }
          else {
            watcherTriggerVM.schedule.daily = { at: { hour: watcherTriggerVM.dailyData.hours, minute: watcherTriggerVM.dailyData.minutes }};
          }
        }
        else if (watcherTriggerVM.type === ScheduleTriggerTypes.WEEKLY) {
          watcherTriggerVM.schedule.weekly = transformWeeklyData(watcherTriggerVM.weeklyData);
        }
        else if (watcherTriggerVM.type === ScheduleTriggerTypes.MONTHLY) {
          watcherTriggerVM.schedule.monthly = transformMonthlyData(watcherTriggerVM.monthlyData);
        }
        else if (watcherTriggerVM.type === ScheduleTriggerTypes.YEARLY) {
          watcherTriggerVM.schedule.yearly = transformYearlyData(watcherTriggerVM.yearlyData);
        }
        watchers.setWatcherScheduleTrigger(watcherTriggerVM.schedule);
      }

      function transformWeeklyData(data) {
        if (watcherTriggerVM.weeklyTimes) {
          return _.map(watcherTriggerVM.weeklyData.times, function(weekDay) {
            var day = weekDay.split('@');
            return { on: day[0], at: day[1] };
          });
        }
        else {
          return { on: data.days, at: data.hours };
        }
      }

      function transformMonthlyData(data) {
        if (watcherTriggerVM.monthlyTimes) {
          return _.map(watcherTriggerVM.monthlyData.times, function(monthDay) {
            var day = monthDay.split('@');
            return { on: day[0], at: day[1] };
          });
        }
        else {
          return { on: data.days, at: data.hours };
        }
      }

      function transformYearlyData(data) {
        if (watcherTriggerVM.yearlyTimes) {
          return _.map(watcherTriggerVM.yearlyData.times, function(yearDay) {
            var day = yearDay.split('@');
            return { in: day[0].substring(0, day[0].length - 2), on: day[0].substring(day[0].length - 2), at: day[1] };
          });
        }
        else {
          return { in: data.months, on: data.days, at: data.hours };
        }
      }

      function getTriggerTypes() {
        return watchers.getScheduleTriggerTypes();
      }

      function loadData(data) {
        if (!_.isEmpty(_.keys(data))) {
          data = data.schedule;
          var type = _.keys(data)[0];

          if (type === ScheduleTriggerTypes.HOURLY) {
            watcherTriggerVM.hours = data.hourly;
          }
          else if (type === ScheduleTriggerTypes.DAILY) {
            loadDailyData(data.daily.at);
          }
          else if (type === ScheduleTriggerTypes.WEEKLY) {
            loadWeeklyData(data.weekly);
          }
          else if (type === ScheduleTriggerTypes.MONTHLY) {
            loadMonthlyData(data.monthly);
          }
          else if (type === ScheduleTriggerTypes.YEARLY) {
            loadYearlyData(data.yearly);
          }
          else if (type === ScheduleTriggerTypes.INTERVAL) {
            watcherTriggerVM.schedule.interval = data.interval;
          }
        }
      }

      function loadDailyData(trigger) {
        watcherTriggerVM.dailyTimes = _.isArray(trigger);

        if (watcherTriggerVM.dailyTimes) {
          watcherTriggerVM.dailyData = { times: trigger, hours: [], minutes: [] };
        }
        else {
          watcherTriggerVM.dailyData = { times: [], hours: trigger.hour, minutes: trigger.minute };
        }
      }

      function loadWeeklyData(trigger) {
        watcherTriggerVM.weeklyTimes = _.isArray(trigger);

        if (watcherTriggerVM.weeklyTimes) {
          watcherTriggerVM.weeklyData.times = _.map(trigger, function(day) {
            return day.on + '@' + day.at;
          });
        }
        else {
          watcherTriggerVM.weeklyData.days = trigger.on;
          watcherTriggerVM.weeklyData.hours = trigger.at;
        }
      }

      function loadMonthlyData(trigger) {
        watcherTriggerVM.monthlyTimes = _.isArray(trigger);

        if (watcherTriggerVM.monthlyTimes) {
          watcherTriggerVM.monthlyData.times = _.map(trigger, function(day) {
            return day.on + '@' + day.at;
          });
        }
        else {
          watcherTriggerVM.monthlyData.days = trigger.on;
          watcherTriggerVM.monthlyData.hours = trigger.at;
        }
      }

      function loadYearlyData(trigger) {
        watcherTriggerVM.yearlyTimes = _.isArray(trigger);

        if (watcherTriggerVM.yearlyTimes) {
          watcherTriggerVM.yearlyData.times = _.map(trigger, function(day) {
            return day.in + day.on + '@' + day.at;
          });
        }
        else {
          watcherTriggerVM.yearlyData.months = trigger.in;
          watcherTriggerVM.yearlyData.days = trigger.on;
          watcherTriggerVM.yearlyData.hours = trigger.at;
        }
      }
    }
})();
