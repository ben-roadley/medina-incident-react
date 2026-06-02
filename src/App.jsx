import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Chip,
  Container,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const incidentApiBaseUrl = import.meta.env.VITE_INCIDENT_API_BASE_URL?.replace(/\/$/, '')

function buildIncidentApiUrl(path) {
  if (incidentApiBaseUrl) {
    return `${incidentApiBaseUrl}${path}`
  }

  return `/api${path}`
}

function App() {
  const [formValues, setFormValues] = useState({
    source: '',
    incidentType: 'airlock',
    severity: 'critical',
    description: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)
  const [lastSubmittedIncident, setLastSubmittedIncident] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const incidentPreview = useMemo(
    () => JSON.stringify(formValues, null, 2),
    [formValues],
  )

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formValues.source.trim()) {
      setErrorMessage('Source is required before an incident can be submitted.')
      return
    }

    const incidentPayload = {
      ...formValues,
      source: formValues.source.trim(),
      description: formValues.description.trim(),
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(buildIncidentApiUrl('/incidents'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify(incidentPayload),
      })

      const responseBody = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(responseBody.message || 'The incident request was rejected by the API.')
      }

      setLastSubmittedIncident({
        ...incidentPayload,
        incidentId: responseBody.incidentId,
        submittedAt: new Date().toLocaleString(),
      })
      setSuccessOpen(true)
    } catch (error) {
      setErrorMessage(error.message || 'The incident could not be submitted.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(133, 188, 255, 0.22), transparent 28%), linear-gradient(180deg, #08131f 0%, #0c1623 42%, #101f2f 100%)',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              background: 'linear-gradient(135deg, rgba(8, 19, 31, 0.9), rgba(16, 31, 47, 0.82))',
              backdropFilter: 'blur(18px)',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Chip label="Medina Station" color="primary" sx={{ width: 'fit-content' }} />
                <Chip label="Incident Operations Console" variant="outlined" sx={{ width: 'fit-content' }} />
              </Stack>

              <Stack spacing={1}>
                <Typography
                  variant="h1"
                  sx={{
                    maxWidth: '12ch',
                    fontSize: { xs: '2.75rem', md: '4.5rem' },
                    lineHeight: 0.98,
                    letterSpacing: '-0.06em',
                  }}
                >
                  Report station incidents before they escalate.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 720, color: 'rgba(226, 232, 240, 0.78)' }}
                >
                  Let's start with a fast operator intake flow. This MVP landing page captures the
                  same core incident fields the backend already accepts and keeps the UI focused
                  on accurate reporting.
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                flex: 1.2,
                p: { xs: 3, md: 4 },
                borderRadius: 5,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="h2" sx={{ fontSize: '1.75rem', letterSpacing: '-0.03em' }}>
                    Post an incident
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(226, 232, 240, 0.7)' }}>
                    Please try to be as accurate as possible regarding severity, no cheating here! Any extra details are helpful.
                  </Typography>
                </Stack>

                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                <TextField
                  label="Source"
                  name="source"
                  value={formValues.source}
                  onChange={handleFieldChange}
                  placeholder="docking-bay-sensor"
                  fullWidth
                  required
                  helperText="Sensor, subsystem, or operator terminal that reported the incident."
                />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Incident type"
                    name="incidentType"
                    value={formValues.incidentType}
                    onChange={handleFieldChange}
                    fullWidth
                  >
                    <MenuItem value="airlock">Airlock</MenuItem>
                    <MenuItem value="radiation">Radiation</MenuItem>
                    <MenuItem value="fire">Fire</MenuItem>
                    <MenuItem value="intrusion">Intrusion</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Severity"
                    name="severity"
                    value={formValues.severity}
                    onChange={handleFieldChange}
                    fullWidth
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </TextField>
                </Stack>

                <TextField
                  label="Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleFieldChange}
                  multiline
                  minRows={5}
                  placeholder="Pressure anomaly detected near Bay 3"
                  helperText="Optional but useful for the operator handoff and escalation trail."
                  fullWidth
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 180 }}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress color="inherit" size={18} /> : null}
                  >
                    {isSubmitting ? 'Submitting' : 'Submit incident'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 0.8,
                p: { xs: 3, md: 4 },
                borderRadius: 5,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: 'linear-gradient(180deg, rgba(12, 22, 35, 0.96), rgba(8, 15, 24, 0.92))',
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '0.14em' }}>
                    Payload Preview
                  </Typography>
                  <Typography variant="h3" sx={{ fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
                    Incident request body
                  </Typography>
                </Stack>

                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    overflowX: 'auto',
                    borderRadius: 3,
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    color: '#dbeafe',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  {incidentPreview}
                </Box>

                {lastSubmittedIncident ? (
                  <Alert severity="success" variant="outlined">
                    Incident {lastSubmittedIncident.incidentId || 'created'} was accepted at{' '}
                    {lastSubmittedIncident.submittedAt}.
                  </Alert>
                ) : (
                  <Alert severity="info" variant="outlined">
                    Submit the form to send a real `POST /incidents` request through the local
                    proxy and capture the created incident ID.
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Stack>

        <Snackbar
          open={successOpen}
          autoHideDuration={3500}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled">
            Incident submitted successfully.
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default App
