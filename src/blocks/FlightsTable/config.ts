import type { Block } from 'payload'

export const FlightsTable: Block = {
  slug: 'flightsTable',
  interfaceName: 'FlightsTableBlock',
  labels: {
    singular: 'Flights Table',
    plural: 'Flights Tables',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
      admin: {
        description: 'Small text above title (e.g., "LIVE UPDATES")',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      admin: {
        description: 'Main heading (e.g., "Flight Schedule")',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtitle',
      admin: {
        description: 'Description text below title',
      },
    },
    {
      name: 'departuresLabel',
      type: 'text',
      label: 'Departures Tab Label',
      defaultValue: 'Uchish',
      required: true,
    },
    {
      name: 'arrivalsLabel',
      type: 'text',
      label: 'Arrivals Tab Label',
      defaultValue: "Qo'nish",
      required: true,
    },
    {
      name: 'tableHeaders',
      type: 'group',
      label: 'Table Column Headers',
      fields: [
        {
          name: 'time',
          type: 'text',
          label: 'Time Column',
          defaultValue: 'Vaqt',
          required: true,
        },
        {
          name: 'destination',
          type: 'text',
          label: 'Destination Column',
          defaultValue: "Yo'nalish",
          required: true,
        },
        {
          name: 'flight',
          type: 'text',
          label: 'Flight Number Column',
          defaultValue: 'Reys',
          required: true,
        },
        {
          name: 'airline',
          type: 'text',
          label: 'Airline Column',
          defaultValue: 'Aviakompaniya',
          required: true,
        },
        {
          name: 'terminal',
          type: 'text',
          label: 'Terminal Column',
          defaultValue: 'Terminal',
          required: true,
        },
        {
          name: 'gate',
          type: 'text',
          label: 'Gate Column',
          defaultValue: 'Chiqish',
          required: true,
        },
        {
          name: 'status',
          type: 'text',
          label: 'Status Column',
          defaultValue: 'Status',
          required: true,
        },
      ],
    },
    {
      name: 'airportIata',
      type: 'text',
      label: 'Airport IATA Code',
      defaultValue: 'NVI',
      admin: {
        description: 'Airport code for Airlabs API (e.g., NVI for Navoi)',
      },
    },
    {
      name: 'refreshInterval',
      type: 'number',
      label: 'Refresh Interval (seconds)',
      defaultValue: 60,
      admin: {
        description: 'How often to refresh flight data from Airlabs API',
      },
    },
  ],
}
