import { Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react'

function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #dee2e6',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <Activity size={24} style={{ marginBottom: '8px' }} />
        <p>Agent Activity Log</p>
        <p style={{ fontSize: '13px' }}>Waiting for activity...</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#1a1a2e',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Activity size={18} />
        Agent Activity Log
      </h3>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: '#dee2e6'
        }} />

        {events.map((event, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              position: 'relative',
              paddingLeft: '24px'
            }}
          >
            <div style={{
              position: 'absolute',
              left: '-7px',
              top: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: event.isResolution ? '#28a745' : '#ffc107',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {event.isResolution ? (
                <CheckCircle size={10} color="white" />
              ) : (
                <AlertCircle size={10} color="white" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1a1a2e'
                }}>
                  {event.event}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  {event.time || event.date || 'Just now'}
                </span>
              </div>
              {event.risk && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: event.risk.severity === 'critical' ? '#dc3545' : 
                         event.risk.severity === 'high' ? '#fd7e14' : '#0052ff'
                }}>
                  {event.risk.severity}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline