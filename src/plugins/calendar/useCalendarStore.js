export const useCalendarStore = defineStore('calendar', {
  // arrow function recommended for full type inference
  state: () => ({
    availableCalendars: [
      {
        color: 'error',
        label: 'Personal',
      },
      {
        color: 'primary',
        label: 'Cita',
      },
      {
        color: 'warning',
        label: 'Vacunación',
      },
      {
        color: 'success',
        label: 'Cirugía',
      },
      {
        color: 'info',
        label: 'ETC',
      },
    ],
    selectedCalendars: ['Personal', 'Cita', 'Vacunación', 'Cirugía', 'ETC'],
  }),
  actions: {
    async fetchEvents() {
      const { data, error } = await useApi(createUrl('/medical-records/calendar', {
       
      }))

      if (error.value)
        return error.value
      console.log(data)

      return data.value.calendars.data
    },
    async addEvent(event) {
      await $api('/apps/calendar', {
        method: 'POST',
        body: event,
      })
    },
    async updateEvent(event) {
      return await $api(`/medical-records/update_aux/${event.id}`, {
        method: 'PUT',
        body: {
          state: event.extendedProps.state,
          notes: event.extendedProps.notes,
        },
      })
    },
    async removeEvent(eventId) {
      return await $api(`/apps/calendar/${eventId}`, {
        method: 'DELETE',
      })
    },
  },
})
