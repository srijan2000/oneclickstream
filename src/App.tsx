import { FormEvent, useMemo, useState } from 'react';

type ConfigureResponse = {
  matchId: string;
  clubId: string;
  overlayUrl: string;
  streamTitle: string;
  watchUrl: string;
  broadcastId: string;
  streamId: string;
  rtmpUrl: string;
  moblinUrl: string;
};

type YoutubeStatusResponse = {
  authenticated?: boolean;
  loggedIn?: boolean;
  message?: string;
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const YOUTUBE_LOGIN_URL = `${API_BASE_URL}/api/youtube/login`;
const YOUTUBE_STATUS_URL = `${API_BASE_URL}/api/youtube/status`;

const DEFAULT_VALUES = {
  cricclubsUrl:
    'https://www.cricclubs.com/LPCL/viewScorecard.do?matchId=4128&clubId=1089463',
  theme: 'kkr',
  teamA: 'Nordic Knights',
  teamB: 'Willow Warriors',
  privacyStatus: 'unlisted'
};

const initialFormState = {
  cricclubsUrl: DEFAULT_VALUES.cricclubsUrl,
  theme: DEFAULT_VALUES.theme,
  teamA: DEFAULT_VALUES.teamA,
  teamB: DEFAULT_VALUES.teamB,
  privacyStatus: DEFAULT_VALUES.privacyStatus
};

const fieldLabels = {
  cricclubsUrl: 'CricClubs URL',
  theme: 'Theme',
  teamA: 'Team A',
  teamB: 'Team B',
  privacyStatus: 'Privacy Status'
} as const;

const privacyOptions = ['unlisted', 'private', 'public'] as const;

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard access is unavailable in this browser.');
  }

  await navigator.clipboard.writeText(value);
}

export default function App() {
  const [form, setForm] = useState(initialFormState);
  const [result, setResult] = useState<ConfigureResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [youtubeStatusLoading, setYoutubeStatusLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState<string | null>(null);

  const hasResult = result !== null;

  const canOpenMoblin = useMemo(() => Boolean(result?.moblinUrl), [result]);

  function updateField<K extends keyof typeof form>(field: K, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setCopyStatus(null);
    setYoutubeStatusMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stream/one-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cricclubsUrl: form.cricclubsUrl.trim(),
          theme: form.theme.trim(),
          teamA: form.teamA.trim(),
          teamB: form.teamB.trim(),
          privacyStatus: form.privacyStatus
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not logged into YouTube. Please login first.');
        }

        const responseText = await response.text();
        let detail = 'Please try again.';

        try {
          const payload = JSON.parse(responseText) as { message?: string; error?: string };
          detail = payload.message || payload.error || detail;
        } catch {
          if (responseText.trim()) {
            detail = responseText;
          }
        }

        throw new Error(detail);
      }

      const data = (await response.json()) as ConfigureResponse;
      setResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setErrorMessage(message === 'You are not logged into YouTube. Please login first.' ? message : `Unable to generate the stream configuration. ${message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleYoutubeStatus() {
    setYoutubeStatusLoading(true);
    setErrorMessage(null);
    setCopyStatus(null);

    try {
      const response = await fetch(YOUTUBE_STATUS_URL, {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not logged into YouTube. Please login first.');
        }

        const responseText = await response.text();
        let detail = 'Please try again.';

        try {
          const payload = JSON.parse(responseText) as { message?: string; error?: string };
          detail = payload.message || payload.error || detail;
        } catch {
          if (responseText.trim()) {
            detail = responseText;
          }
        }

        throw new Error(detail);
      }

      const data = (await response.json()) as YoutubeStatusResponse;
      const isLoggedIn = data.loggedIn ?? data.authenticated ?? true;
      const statusText = data.message || (isLoggedIn ? 'YouTube is connected.' : 'YouTube is not connected.');
      setYoutubeStatusMessage(statusText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setYoutubeStatusMessage(message);
    } finally {
      setYoutubeStatusLoading(false);
    }
  }

  async function handleCopy(value: string, label: string) {
    try {
      await copyToClipboard(value);
      setCopyStatus(`${label} copied to clipboard.`);
    } catch {
      setCopyStatus(`Copying ${label.toLowerCase()} is not supported on this browser.`);
    }
  }

  function openMoblin() {
    if (result?.moblinUrl) {
      window.location.href = result.moblinUrl;
    }
  }

  function openYoutubeLive() {
    if (result?.watchUrl) {
      window.open(result.watchUrl, '_blank');
    }
  }

  function openYoutubeLogin() {
    window.location.href = YOUTUBE_LOGIN_URL;
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">oneclickstreemUI</span>
          <h1>Generate a stream config in one tap.</h1>
          <p>
            Paste a CricClubs scorecard link, choose a theme, and get the overlay and Moblin links
            ready for your stream.
          </p>
        </div>

        <div className="status-card">
          <span className="status-label">API base URL</span>
          <strong>{API_BASE_URL}</strong>
          <p>Configure this with <code>VITE_API_BASE_URL</code> for iPhone Safari access.</p>
          <div className="status-actions">
            <button type="button" className="secondary-button" onClick={openYoutubeLogin}>
              Login to YouTube
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleYoutubeStatus}
              disabled={youtubeStatusLoading}
            >
              {youtubeStatusLoading ? 'Checking YouTube Status...' : 'Check YouTube Status'}
            </button>
          </div>
          {youtubeStatusMessage ? <p className="status-note">{youtubeStatusMessage}</p> : null}
        </div>
      </section>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Stream details</h2>
            <p>Defaults are prefilled so you can generate immediately.</p>
          </div>

          <div className="field-group">
            <label htmlFor="cricclubsUrl">{fieldLabels.cricclubsUrl}</label>
            <input
              id="cricclubsUrl"
              type="url"
              inputMode="url"
              value={form.cricclubsUrl}
              onChange={(event) => updateField('cricclubsUrl', event.target.value)}
              placeholder="https://www.cricclubs.com/..."
              autoComplete="off"
              required
            />
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="teamA">{fieldLabels.teamA}</label>
              <input
                id="teamA"
                type="text"
                value={form.teamA}
                onChange={(event) => updateField('teamA', event.target.value)}
                placeholder="Team A"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="teamB">{fieldLabels.teamB}</label>
              <input
                id="teamB"
                type="text"
                value={form.teamB}
                onChange={(event) => updateField('teamB', event.target.value)}
                placeholder="Team B"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="theme">{fieldLabels.theme}</label>
            <input
              id="theme"
              type="text"
              value={form.theme}
              onChange={(event) => updateField('theme', event.target.value)}
              placeholder="kkr"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="privacyStatus">{fieldLabels.privacyStatus}</label>
            <select
              id="privacyStatus"
              value={form.privacyStatus}
              onChange={(event) => updateField('privacyStatus', event.target.value)}
            >
              {privacyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Creating YouTube Live and Moblin configuration...' : 'Generate Stream Configuration'}
          </button>

          {errorMessage ? (
            <div className="message message-error" role="alert">
              {errorMessage}
            </div>
          ) : null}
        </form>

        <section className="panel result-panel" aria-live="polite">
          <div className="panel-header">
            <h2>Generated output</h2>
            <p>{hasResult ? 'Ready to copy or open in Moblin.' : 'Your generated configuration will appear here.'}</p>
          </div>

          {copyStatus ? <div className="message message-success">{copyStatus}</div> : null}

          {hasResult && result ? (
            <div className="result-stack">
              <div className="result-item">
                <span>Match ID</span>
                <strong>{result.matchId}</strong>
              </div>
              <div className="result-item">
                <span>Club ID</span>
                <strong>{result.clubId}</strong>
              </div>
              <div className="result-item">
                <span>Stream Title</span>
                <strong>{result.streamTitle}</strong>
              </div>
              <div className="result-item result-link-item">
                <span>YouTube Watch URL</span>
                <a href={result.watchUrl} target="_blank" rel="noreferrer">
                  {result.watchUrl}
                </a>
                <div className="action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(result.watchUrl, 'YouTube Watch URL')}
                  >
                    Copy YouTube Watch URL
                  </button>
                  <button type="button" className="secondary-button" onClick={openYoutubeLive}>
                    Open YouTube Live
                  </button>
                </div>
              </div>
              <div className="result-item">
                <span>Broadcast ID</span>
                <strong>{result.broadcastId}</strong>
              </div>
              <div className="result-item">
                <span>Stream ID</span>
                <strong>{result.streamId}</strong>
              </div>
              <div className="result-item result-link-item">
                <span>RTMP URL</span>
                <strong>{result.rtmpUrl}</strong>
                <div className="action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(result.rtmpUrl, 'RTMP URL')}
                  >
                    Copy RTMP URL
                  </button>
                </div>
              </div>
              <div className="result-item result-link-item">
                <span>Overlay URL</span>
                <a href={result.overlayUrl} target="_blank" rel="noreferrer">
                  {result.overlayUrl}
                </a>
                <div className="action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(result.overlayUrl, 'Overlay URL')}
                  >
                    Copy Overlay URL
                  </button>
                </div>
              </div>
              <div className="result-item result-link-item">
                <span>Moblin URL</span>
                <a href={result.moblinUrl} target="_blank" rel="noreferrer">
                  {result.moblinUrl}
                </a>
                <div className="action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(result.moblinUrl, 'Moblin URL')}
                  >
                    Copy Moblin URL
                  </button>
                </div>
              </div>
              <div className="action-row action-row-full">
                <button
                  type="button"
                  className="primary-button secondary-action"
                  onClick={openMoblin}
                  disabled={!canOpenMoblin}
                >
                  Open in Moblin
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-badge">Waiting for API response</div>
              <p>
                The response from <code>/api/stream/one-click</code> will show up here once you generate it.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
