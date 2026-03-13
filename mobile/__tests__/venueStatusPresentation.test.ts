import {
  formatLiveStatusLabel,
  formatVenueStatusLabel,
  toLiveStatusTone,
  toVenueStatusTone,
} from '../src/screens/venueStatusPresentation';

describe('venueStatusPresentation', () => {
  it('formats canonical venue status labels consistently', () => {
    expect(formatVenueStatusLabel('active')).toBe('Active');
    expect(formatVenueStatusLabel('pending')).toBe('Pending');
    expect(formatVenueStatusLabel('rejected')).toBe('Rejected');
    expect(formatVenueStatusLabel('suspended')).toBe('Suspended');
    expect(formatVenueStatusLabel('expired')).toBe('Expired');
  });

  it('maps venue statuses to deterministic badge tones', () => {
    expect(toVenueStatusTone('active')).toBe('success');
    expect(toVenueStatusTone('pending')).toBe('warning');
    expect(toVenueStatusTone('rejected')).toBe('danger');
    expect(toVenueStatusTone('suspended')).toBe('danger');
    expect(toVenueStatusTone('expired')).toBe('danger');
  });

  it('maps live statuses to consistent labels and tones', () => {
    expect(formatLiveStatusLabel('busy')).toBe('Busy now');
    expect(formatLiveStatusLabel('steady')).toBe('Steady now');
    expect(formatLiveStatusLabel('calm')).toBe('Calm now');

    expect(toLiveStatusTone('busy')).toBe('danger');
    expect(toLiveStatusTone('steady')).toBe('warning');
    expect(toLiveStatusTone('calm')).toBe('success');
  });
});
