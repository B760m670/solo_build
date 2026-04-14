import { useState } from 'react';
import { useDecodeTonTransaction, useInspectTonAddress } from '../hooks/useServices';
import ErrorState from '../components/ErrorState';
import { useTranslation } from '../lib/i18n';

function Services() {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [txRef, setTxRef] = useState('');
  const inspect = useInspectTonAddress();
  const decode = useDecodeTonTransaction();

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{t('servicesTitle')}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('servicesSubtitle')}</p>
      </div>

      <div className="rounded-card p-4 border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('tonAddressInspector')}</p>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="EQ... / UQ... / 0:..."
          className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono"
          style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <button
          onClick={() => inspect.mutate(address.trim())}
          disabled={!address.trim() || inspect.isPending}
          className="w-full py-2.5 text-sm font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {inspect.isPending ? t('processing') : t('inspectAddress')}
        </button>
        {inspect.isError && <ErrorState message={inspect.error.message} />}
        {inspect.data && (
          <div className="rounded-btn p-3 border space-y-1" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: inspect.data.isValid ? 'var(--teal)' : '#FF3B30' }}>
              {inspect.data.isValid ? t('addressValid') : t('addressInvalid')}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {t('formatLabel')}: {inspect.data.format}
            </p>
            {inspect.data.workchain && (
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {t('workchainLabel')}: {inspect.data.workchain}
              </p>
            )}
            {inspect.data.warnings.map((w) => (
              <p key={w} className="text-[11px]" style={{ color: '#FF3B30' }}>{w}</p>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-card p-4 border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('txDecoder')}</p>
        <input
          value={txRef}
          onChange={(e) => setTxRef(e.target.value)}
          placeholder={t('txDecoderPlaceholder')}
          className="w-full px-3 py-2.5 rounded-btn text-sm outline-none border font-mono"
          style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <button
          onClick={() => decode.mutate(txRef.trim())}
          disabled={!txRef.trim() || decode.isPending}
          className="w-full py-2.5 text-sm font-medium rounded-btn"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {decode.isPending ? t('processing') : t('decodeTx')}
        </button>
        {decode.isError && <ErrorState message={decode.error.message} />}
        {decode.data && (
          <div className="rounded-btn p-3 border space-y-2" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-xs break-all font-mono" style={{ color: 'var(--text)' }}>
              {decode.data.txHash}
            </p>
            <p className="text-[11px]" style={{ color: decode.data.isHashValid ? 'var(--teal)' : '#FF3B30' }}>
              {decode.data.isHashValid ? t('txHashValid') : t('txHashInvalid')}
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={decode.data.explorerLinks.tonviewer} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>Tonviewer</a>
              <a href={decode.data.explorerLinks.tonscan} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>Tonscan</a>
              <a href={decode.data.explorerLinks.dton} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: 'var(--accent)' }}>dTon</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;
