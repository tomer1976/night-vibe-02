import { VenueSummary } from '../contracts';

type VenueStatusTone = 'success' | 'warning' | 'danger';
type VenueLiveStatusTone = 'success' | 'warning' | 'danger';

function toTitleCaseLabel(value: string): string {
  return value
    .split('_')
    .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`)
    .join(' ');
}

export function formatVenueStatusLabel(status: VenueSummary['status']): string {
  return toTitleCaseLabel(status);
}

export function toVenueStatusTone(status: VenueSummary['status']): VenueStatusTone {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'pending') {
    return 'warning';
  }

  return 'danger';
}

export function formatLiveStatusLabel(status: VenueSummary['activitySnapshot']['liveStatus']): string {
  if (status === 'busy') {
    return 'Busy now';
  }

  if (status === 'steady') {
    return 'Steady now';
  }

  return 'Calm now';
}

export function toLiveStatusTone(status: VenueSummary['activitySnapshot']['liveStatus']): VenueLiveStatusTone {
  if (status === 'busy') {
    return 'danger';
  }

  if (status === 'steady') {
    return 'warning';
  }

  return 'success';
}
