import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Server, Key, Copy, CheckCheck, RefreshCw, Sparkles } from 'lucide-react';
import Header from '../components/layout/Header';
import { useApiStore } from '../store/apiStore';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function Settings() {
  const { baseUrl, apiKey, setBaseUrl, setApiKey } = useApiStore();
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localKey, setLocalKey] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newKey, setNewKey] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setBaseUrl(localUrl.replace(/\/$/, ''));
    setApiKey(localKey);
    toast.success('Configuration saved');
  }

  async function testConnection() {
    setTesting(true);
    try {
      setBaseUrl(localUrl.replace(/\/$/, ''));
      setApiKey(localKey);
      await api.health.check();
      toast.success('✅ Connection successful!');
    } catch {
      toast.error('Connection failed — check URL and API key');
    } finally {
      setTesting(false);
    }
  }

  async function generateKey() {
    setGenerating(true);
    try {
      const res = await api.dev.generateKey();
      const key = typeof res.data === 'string' ? res.data : res.data?.key || String(res.data);
      setNewKey(key);
      setLocalKey(key);
      toast.success('API key generated');
    } catch {
      toast.error('Key generation failed — make sure the backend is running');
    } finally {
      setGenerating(false);
    }
  }

  function copyKey() {
    const k = newKey || localKey;
    if (!k) return;
    navigator.clipboard.writeText(k);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" subtitle="Configure your API connection and authentication" />

      <div className="flex-1 p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Connection */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Server className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-text-primary">API Connection</h2>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Backend Base URL</label>
                <input
                  className="input"
                  type="url"
                  placeholder="http://localhost:8080"
                  value={localUrl}
                  onChange={e => setLocalUrl(e.target.value)}
                />
                <p className="text-xs text-text-faint mt-1.5">The root URL of your Spring Boot backend.</p>
              </div>
              <div>
                <label className="label">API Key (X-API-KEY)</label>
                <div className="relative">
                  <input
                    className="input pr-10 font-mono"
                    type="text"
                    placeholder="Paste your API key here…"
                    value={localKey}
                    onChange={e => setLocalKey(e.target.value)}
                  />
                  {localKey && (
                    <button type="button" onClick={copyKey} className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-ghost p-1">
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <p className="text-xs text-text-faint mt-1.5">Required for all API requests. Generate one below.</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary">
                  <Settings2 className="w-3.5 h-3.5" /> Save Config
                </button>
                <button type="button" className="btn-secondary" onClick={testConnection} disabled={testing}>
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {testing ? 'Testing…' : 'Test Connection'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* API Key Generator */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Key className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-text-primary">Generate API Key</h2>
              <span className="badge-pending ml-1">Dev Only</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Calls <code className="text-xs bg-bg-hover px-1.5 py-0.5 rounded text-violet-400">POST /dev/generate-api-key</code> to generate
              a new hashed key stored in the database. The raw key is shown once — copy it immediately.
            </p>
            <button className="btn-primary mb-4" onClick={generateKey} disabled={generating}>
              {generating
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />
              }
              {generating ? 'Generating…' : 'Generate New Key'}
            </button>

            {newKey && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-bg-base border border-emerald-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Your New API Key</p>
                  <button onClick={copyKey} className="btn-ghost py-1 px-2 text-xs gap-1">
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-sm text-text-primary break-all">{newKey}</p>
                <p className="text-xs text-amber-400 mt-2">⚠ This is shown only once. It has been pre-filled in the API Key field above.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card p-5 border-gradient"
          >
            <p className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Platform Architecture</p>
            <div className="space-y-2 text-sm text-text-faint">
              {[
                ['Stack',         'Spring Boot 4.1 · PostgreSQL · Apache Kafka'],
                ['Auth',          'SHA-256 hashed API keys via X-API-KEY header'],
                ['Retry Logic',   'Exponential backoff, up to 5 retries, then DEAD_LETTER'],
                ['Circuit Breaker','Resilience4j per-subscriber, sliding window of 5 calls'],
                ['Signing',       'HMAC-SHA256 payload signing with per-subscriber secret'],
                ['SSRF Protection','Private / loopback IPs rejected at subscription time'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-text-faint w-36 flex-shrink-0">{k}</span>
                  <span className="text-text-secondary">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
