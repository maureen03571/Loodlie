import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../App'

const SOURCES = [
  { id: 'whatsapp',     label: 'WhatsApp',     icon: '💬', color: '#25D366', bg: 'rgba(37,211,102,0.15)' },
  { id: 'screenshots',  label: 'Screenshots',  icon: '📸', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 'pinterest',    label: 'Pinterest',    icon: '📌', color: '#e60023', bg: 'rgba(230,0,35,0.15)'   },
  { id: 'instagram',    label: 'Instagram',    icon: '📷', color: '#e1306c', bg: 'rgba(225,48,108,0.15)' },
  { id: 'facebook',     label: 'Facebook',     icon: '👍', color: '#1877f2', bg: 'rgba(24,119,242,0.15)' },
  { id: 'other',        label: 'Other',        icon: '🗂️', color: '#8b949e', bg: 'rgba(139,148,158,0.15)'},
]

// ===== Lightbox =====
function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img
        className="lightbox-img"
        src={photo.src}
        alt="Full view"
        onClick={e => e.stopPropagation()}
      />
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', borderRadius: '100px',
        padding: '8px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        {new Date(photo.addedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

// ===== Photo grid item =====
function PhotoItem({ photo, onDelete, onClick }) {
  return (
    <div className="photo-item" onClick={() => onClick(photo)}>
      <img src={photo.src} alt="gallery" loading="lazy" />
      <div className="photo-item-overlay">
        <span className="photo-date">
          {new Date(photo.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button
          className="photo-delete-btn"
          onClick={e => { e.stopPropagation(); onDelete(photo.id) }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

// ===== Camera Section =====
function CameraSection({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [facingMode, setFacingMode] = useState('user')
  const [flash, setFlash] = useState(false)
  const streamRef = useRef(null)

  const startCamera = async () => {
    setError('')
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setStreaming(true)
    } catch (err) {
      setError(err.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permissions in your browser.'
        : 'Camera not available on this device or browser.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setStreaming(false)
  }

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth || 1280
    c.height = v.videoHeight || 720
    const ctx = c.getContext('2d')
    if (facingMode === 'user') {
      ctx.translate(c.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    onCapture(dataUrl)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (streaming) {
      stopCamera()
      setTimeout(startCamera, 300)
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="camera-section">
      {/* Live preview */}
      <div className="camera-view">
        <video
          ref={videoRef}
          style={{
            display: streaming ? 'block' : 'none',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />
        {flash && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.8)',
            animation: 'none',
          }} />
        )}
        {!streaming && (
          <div className="camera-overlay">
            <div style={{ fontSize: '48px' }}>📷</div>
            <div className="camera-overlay-text">
              {error || 'Click "Start Camera" to begin capturing'}
            </div>
            {error && (
              <div style={{
                fontSize: '12px', color: 'var(--text-muted)',
                maxWidth: '280px', textAlign: 'center', marginTop: '4px',
              }}>
                You can still upload photos using the "Upload from Files" button
              </div>
            )}
          </div>
        )}
        {streaming && (
          <>
            <div className="camera-corner tl" />
            <div className="camera-corner tr" />
            <div className="camera-corner bl" />
            <div className="camera-corner br" />
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      <div className="camera-controls">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Camera Controls
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {streaming ? '🟢 Camera active' : '⚫ Camera off'}
          </div>
        </div>

        <button
          className="btn-capture"
          onClick={streaming ? capture : startCamera}
          title={streaming ? 'Take a photo' : 'Start camera'}
        >
          {streaming ? '📷' : '▶️'}
        </button>

        <div style={{
          fontSize: '12px', color: 'var(--text-muted)',
          textAlign: 'center', marginTop: '-4px',
        }}>
          {streaming ? 'Tap to capture' : 'Start camera'}
        </div>

        {streaming && (
          <>
            <button className="btn-camera-toggle" onClick={switchCamera}>
              🔄 Flip Camera
            </button>
            <button className="btn-camera-toggle" onClick={stopCamera} style={{ color: '#f87171' }}>
              ⏹ Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ===== Source Album Card =====
function SourceAlbumCard({ source, photos, onAdd, onDelete, onView }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => onAdd(source.id, ev.target.result)
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const previewPhotos = photos.slice(0, 6)

  return (
    <div className="source-album">
      <div className="source-album-header">
        <div
          className="source-album-icon"
          style={{ background: source.bg, border: `1px solid ${source.color}44` }}
        >
          {source.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="source-album-name">{source.label}</div>
          <div className="source-album-count">
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </div>
        </div>
        {photos.length > 6 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            +{photos.length - 6} more
          </div>
        )}
      </div>

      <div className="source-album-body">
        {previewPhotos.length > 0 ? (
          <div className="source-mini-grid">
            {previewPhotos.map(p => (
              <div
                key={p.id}
                className="source-mini-photo"
                onClick={() => onView(p)}
                style={{ cursor: 'pointer' }}
              >
                <img src={p.src} alt="" loading="lazy" />
              </div>
            ))}
            {/* Fill empty slots */}
            {[...Array(Math.max(0, 3 - previewPhotos.length))].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="source-mini-photo"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            height: '80px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text-muted)',
            fontSize: '13px', marginBottom: '10px',
          }}>
            No photos yet
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden-file-input"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <button
          className="btn-add-to-source"
          onClick={() => fileInputRef.current?.click()}
        >
          <span style={{ fontSize: '16px' }}>＋</span>
          Add from {source.label}
        </button>
      </div>
    </div>
  )
}

// ===== Main Gallery Dashboard =====
export default function GalleryDashboard() {
  const { galleryPhotos, addGalleryPhoto, deleteGalleryPhoto } = useApp()
  const [activeTab, setActiveTab] = useState('camera')
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const fileInputRef = useRef(null)

  const cameraPhotos = galleryPhotos.camera || []
  const allPhotos = Object.values(galleryPhotos).flat()
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))

  const handleCameraCapture = (dataUrl) => {
    addGalleryPhoto('camera', dataUrl)
  }

  const handleUploadFromFiles = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => addGalleryPhoto('camera', ev.target.result)
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const TABS = [
    { id: 'camera',  label: '📷 Camera', count: cameraPhotos.length },
    { id: 'all',     label: '🖼️ All Photos', count: allPhotos.length },
    { id: 'albums',  label: '📁 Albums', count: SOURCES.length },
  ]

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="welcome-header">
        <div className="welcome-greeting">🖼️ Gallery</div>
        <h1 className="welcome-name">Your Gallery</h1>
        <div className="welcome-sub">Capture memories, organize your photos by source</div>
        <div className="welcome-stats">
          <div className="stat-chip">📷 <span>{cameraPhotos.length}</span> captured</div>
          <div className="stat-chip">🖼️ <span>{allPhotos.length}</span> total photos</div>
          <div className="stat-chip">📁 <span>{SOURCES.length}</span> albums</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="gallery-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`gallery-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                marginLeft: '6px', fontSize: '11px',
                background: activeTab === tab.id ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)',
                padding: '1px 7px', borderRadius: '100px',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Camera Tab ===== */}
      {activeTab === 'camera' && (
        <div>
          <CameraSection onCapture={handleCameraCapture} />

          {/* Upload fallback */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Upload from Files
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Add photos directly from your device (downloads, gallery, etc.)
                </div>
              </div>
              <button
                className="btn-add"
                onClick={() => fileInputRef.current?.click()}
              >
                📂 Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden-file-input"
                accept="image/*"
                multiple
                onChange={handleUploadFromFiles}
              />
            </div>
          </div>

          {/* Camera roll */}
          <div className="card">
            <div className="card-title">📷 Camera Roll</div>
            <div className="card-desc">Photos captured with your camera</div>

            {cameraPhotos.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 0' }}>
                <div className="empty-state-icon">📷</div>
                <div className="empty-state-text">No photos yet — use the camera above or upload files!</div>
              </div>
            ) : (
              <div className="photo-grid">
                {cameraPhotos.map(photo => (
                  <PhotoItem
                    key={photo.id}
                    photo={photo}
                    onDelete={(id) => deleteGalleryPhoto('camera', id)}
                    onClick={setLightboxPhoto}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== All Photos Tab ===== */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="card-title">🖼️ All Photos</div>
          <div className="card-desc">Every photo across all your albums, newest first</div>

          {allPhotos.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <div className="empty-state-icon">🖼️</div>
              <div className="empty-state-text">No photos yet — start by capturing or importing some!</div>
            </div>
          ) : (
            <div className="photo-grid">
              {allPhotos.map(photo => (
                <PhotoItem
                  key={photo.id}
                  photo={photo}
                  onDelete={(id) => deleteGalleryPhoto(photo.source, id)}
                  onClick={setLightboxPhoto}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Albums Tab ===== */}
      {activeTab === 'albums' && (
        <div>
          <div className="source-albums">
            {SOURCES.map(source => (
              <SourceAlbumCard
                key={source.id}
                source={source}
                photos={galleryPhotos[source.id] || []}
                onAdd={addGalleryPhoto}
                onDelete={(id) => deleteGalleryPhoto(source.id, id)}
                onView={setLightboxPhoto}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </div>
  )
}
