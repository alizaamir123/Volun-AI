import React, { useState, useEffect } from 'react'
import {
  Button,
  Chip,
  Fade,
  MenuItem,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Zoom,
  Slide,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { api, errorMessage } from '../../lib/api'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  LocationCity as LocationCityIcon,
  LinkedIn as LinkedInIcon,
  Business as BusinessIcon,
  VolunteerActivism as OrganizerIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Done as DoneIcon,
  Groups as GroupsIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  RocketLaunch as RocketIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  CreditCard as CnicIcon,
  Home as AddressIcon,
  Upload as UploadIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import './OrganizerSignupPage.css'

const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'ICT']
const presetSkills = ['Event Planning', 'Volunteer Management', 'Fundraising', 'Marketing', 'Community Engagement', 'Project Management', 'Teaching', 'Healthcare']
const availabilitySlots = ['Morning (9-12)', 'Afternoon (12-3)', 'Evening (3-6)', 'Night (6-9)']

const schema = yup.object({
  fullName: yup.string().required('Full name is required').min(3, 'Min 3 chars'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  cnicNumber: yup.string().required('CNIC number is required'),
  organizationName: yup.string().required('Organization name is required').min(3, 'Min 3 chars'),
  officialEmail: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required').matches(/^[0-9]{10,13}$/, '10-13 digits required'),
  linkedinProfile: yup.string().url('Invalid URL').required('LinkedIn profile is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  province: yup.string().required('Province is required'),
  password: yup.string().min(8, 'Min 8 chars').matches(/[A-Z]/, '1 uppercase').matches(/[a-z]/, '1 lowercase').matches(/[0-9]/, '1 number').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
})

export function OrganizerSignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  
  const [cnicFront, setCnicFront] = useState(null)
  const [cnicBack, setCnicBack] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [customSkill, setCustomSkill] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState([])

  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm({ 
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '', dateOfBirth: '', cnicNumber: '', organizationName: '',
      officialEmail: '', phoneNumber: '', linkedinProfile: '', address: '',
      city: '', province: provinces[0], password: '', confirmPassword: '',
    }
  })

  const watchAll = watch()

  // Typing Animation
  useEffect(() => {
    const fullText = "Lead the Change as an Organizer"
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Particles Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDuration = Math.random() * 3 + 2 + 's'
      particle.style.width = particle.style.height = Math.random() * 8 + 4 + 'px'
      document.querySelector('.particles-container')?.appendChild(particle)
      setTimeout(() => particle.remove(), 5000)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    { id: 0, label: 'Personal', icon: <PersonIcon />, fields: ['fullName', 'dateOfBirth', 'cnicNumber'] },
    { id: 1, label: 'ID Upload', icon: <UploadIcon />, fields: [] },
    { id: 2, label: 'Organization', icon: <BusinessIcon />, fields: ['organizationName', 'officialEmail', 'phoneNumber', 'linkedinProfile'] },
    { id: 3, label: 'Location', icon: <LocationCityIcon />, fields: ['address', 'city', 'province'] },
    { id: 4, label: 'Skills', icon: <BadgeIcon />, fields: [] },
    { id: 5, label: 'Availability', icon: <CalendarIcon />, fields: [] },
    { id: 6, label: 'Security', icon: <LockIcon />, fields: ['password', 'confirmPassword'] },
  ]
const isStepComplete = (stepId) => {
  if (stepId === 0) return watchAll.fullName && watchAll.dateOfBirth && watchAll.cnicNumber
  if (stepId === 1) return cnicFront && cnicBack
  if (stepId === 2) return watchAll.organizationName && watchAll.officialEmail && watchAll.phoneNumber && watchAll.linkedinProfile
  if (stepId === 3) return watchAll.address && watchAll.city && watchAll.province
  if (stepId === 4) return selectedSkills.length > 0   // YEH CHANGE KIYA
  if (stepId === 5) return selectedAvailability.length > 0   // YEH CHANGE KIYA
  if (stepId === 6) return watchAll.password && watchAll.confirmPassword && watchAll.password === watchAll.confirmPassword && watchAll.password?.length >= 8
  return false
}

  const handleNext = async () => {
    const currentStep = steps[step]
    if (currentStep.fields.length > 0) {
      const isValid = await trigger(currentStep.fields)
      if (!isValid) return
    }
    
    if (step === 1 && (!cnicFront || !cnicBack)) {
      setError('Please upload both front and back images of CNIC')
      return
    }
    
    setError(null)
    if (step === steps.length - 1) await onSubmit()
    else setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const addSkill = (s) => !selectedSkills.includes(s) && setSelectedSkills([...selectedSkills, s])
  const removeSkill = (s) => setSelectedSkills(selectedSkills.filter(i => i !== s))
  const addCustomSkill = () => { 
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) { 
      setSelectedSkills([...selectedSkills, customSkill.trim()]); 
      setCustomSkill('') 
    } 
  }
  
  const toggleAvailability = (slot) => {
    if (selectedAvailability.includes(slot)) {
      setSelectedAvailability(selectedAvailability.filter((s) => s !== slot))
    } else {
      setSelectedAvailability([...selectedAvailability, slot])
    }
  }

  const onSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('full_name', watchAll.fullName)
      fd.append('date_of_birth', watchAll.dateOfBirth)
      fd.append('cnic_number', watchAll.cnicNumber)
      fd.append('organization_name', watchAll.organizationName)
      fd.append('official_email', watchAll.officialEmail)
      fd.append('password', watchAll.password)
      fd.append('phone_number', watchAll.phoneNumber)
      fd.append('linkedin_profile', watchAll.linkedinProfile)
      fd.append('address', watchAll.address)
      fd.append('city', watchAll.city)
      fd.append('province', watchAll.province)
      fd.append('skills', selectedSkills.join(', '))
      fd.append('availability', selectedAvailability.join(', '))
      fd.append('cnic_front', cnicFront)
      fd.append('cnic_back', cnicBack)
      
      await api.post('/api/v1/auth/register/organizer', fd)
      setSubmitted(true)
      enqueueSnackbar('Application submitted! Awaiting admin approval.', { variant: 'info' })
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      setError(errorMessage(e, 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch(step) {
      case 0: 
        return (
          <Zoom in timeout={400}>
            <div>
              <div className="form-row">
                <TextField size="small" fullWidth label="Full Name" {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} InputProps={{ startAdornment: <PersonIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} {...register('dateOfBirth')} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message} InputProps={{ startAdornment: <CalendarIcon className="field-icon" /> }} />
              </div>
              <div className="form-row">
                <TextField size="small" fullWidth label="CNIC Number" placeholder="12345-1234567-1" {...register('cnicNumber')} error={!!errors.cnicNumber} helperText={errors.cnicNumber?.message} InputProps={{ startAdornment: <CnicIcon className="field-icon" /> }} />
              </div>
            </div>
          </Zoom>
        )
      case 1:
        return (
          <Zoom in timeout={400}>
            <div className="upload-row">
              <div className="upload-box">
                <Typography variant="subtitle2" className="upload-label"><UploadIcon /> CNIC Front Image *</Typography>
                <input type="file" accept="image/*" onChange={(e) => setCnicFront(e.target.files?.[0] ?? null)} className="file-input" />
                {cnicFront && <Typography variant="caption" className="file-name">Selected: {cnicFront.name}</Typography>}
              </div>
              <div className="upload-box">
                <Typography variant="subtitle2" className="upload-label"><UploadIcon /> CNIC Back Image *</Typography>
                <input type="file" accept="image/*" onChange={(e) => setCnicBack(e.target.files?.[0] ?? null)} className="file-input" />
                {cnicBack && <Typography variant="caption" className="file-name">Selected: {cnicBack.name}</Typography>}
              </div>
            </div>
          </Zoom>
        )
      case 2:
        return (
          <Zoom in timeout={400}>
            <div>
              <div className="form-row">
                <TextField size="small" fullWidth label="Organization Name" {...register('organizationName')} error={!!errors.organizationName} helperText={errors.organizationName?.message} InputProps={{ startAdornment: <BusinessIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth label="Official Email" type="email" {...register('officialEmail')} error={!!errors.officialEmail} helperText={errors.officialEmail?.message} InputProps={{ startAdornment: <EmailIcon className="field-icon" /> }} />
              </div>
              <div className="form-row">
                <TextField size="small" fullWidth label="Phone Number" {...register('phoneNumber')} error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} InputProps={{ startAdornment: <PhoneIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth label="LinkedIn Profile" {...register('linkedinProfile')} error={!!errors.linkedinProfile} helperText={errors.linkedinProfile?.message} InputProps={{ startAdornment: <LinkedInIcon className="field-icon" /> }} />
              </div>
            </div>
          </Zoom>
        )
      case 3:
        return (
          <Zoom in timeout={400}>
            <div>
              <div className="form-row">
                <TextField size="small" fullWidth label="Address" {...register('address')} error={!!errors.address} helperText={errors.address?.message} InputProps={{ startAdornment: <AddressIcon className="field-icon" /> }} />
              </div>
              <div className="form-row">
                <TextField size="small" fullWidth label="City" {...register('city')} error={!!errors.city} helperText={errors.city?.message} InputProps={{ startAdornment: <LocationCityIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth select label="Province" defaultValue={provinces[0]} {...register('province')} error={!!errors.province} helperText={errors.province?.message}>
                  {provinces.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
              </div>
            </div>
          </Zoom>
        )
      case 4:
        return (
          <Slide direction="up" in timeout={400}>
            <div>
              <div className="section-title">YOUR SKILLS</div>
              <div className="chips-container">
                {presetSkills.map(s => (
                  <Chip key={s} label={s} onClick={() => addSkill(s)} className={selectedSkills.includes(s) ? 'chip-active' : 'chip'} />
                ))}
              </div>
              <div className="custom-input-row">
                <TextField size="small" placeholder="Add custom skill..." value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomSkill()} fullWidth InputProps={{ startAdornment: <BadgeIcon className="field-icon" /> }} />
                <Button size="small" onClick={addCustomSkill} className="add-btn">Add +</Button>
              </div>
              {selectedSkills.length > 0 && (
                <div className="selected-items">
                  <div className="selected-label"> Your Skills ({selectedSkills.length})</div>
                  <div className="selected-chips">
                    {selectedSkills.map(s => <Chip key={s} label={s} onDelete={() => removeSkill(s)} size="small" className="selected-chip" />)}
                  </div>
                </div>
              )}
            </div>
          </Slide>
        )
      case 5:
        return (
          <Slide direction="up" in timeout={400}>
            <div>
              <div className="section-title">AVAILABILITY SLOTS</div>
              <div className="chips-container">
                {availabilitySlots.map(slot => (
                  <Chip key={slot} label={slot} onClick={() => toggleAvailability(slot)} className={selectedAvailability.includes(slot) ? 'chip-active' : 'chip'} />
                ))}
              </div>
              {selectedAvailability.length > 0 && (
                <div className="selected-items">
                  <div className="selected-label"> Your Availability ({selectedAvailability.length})</div>
                  <div className="selected-chips">
                    {selectedAvailability.map(slot => <Chip key={slot} label={slot} onDelete={() => toggleAvailability(slot)} size="small" className="selected-chip" />)}
                  </div>
                </div>
              )}
            </div>
          </Slide>
        )
      case 6:
        return (
          <Zoom in timeout={400}>
            <div className="form-row">
              <TextField size="small" fullWidth label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} InputProps={{ startAdornment: <LockIcon className="field-icon" /> }} />
              <TextField size="small" fullWidth label="Confirm Password" type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} InputProps={{ startAdornment: <LockIcon className="field-icon" /> }} />
            </div>
          </Zoom>
        )
      default: 
        return <div>Loading...</div>
    }
  }

  return (
    <div className="organizer-signup-wrapper">
      <div className="particles-container"></div>

      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <RocketIcon className="welcome-icon" />
            <h2>Welcome Organizer! </h2>
            <p>Let's start your journey as a change maker</p>
          </div>
        </div>
      )}

      {submitted && (
        <div className="submitted-overlay">
          <div className="submitted-card">
            <VerifiedIcon className="submitted-icon" />
            <h2>Application Submitted!</h2>
            <p>Your status is <strong>Pending</strong>. You will be able to log in after admin approval.</p>
            <button className="submitted-btn" onClick={() => navigate('/login')}>Go to Login</button>
          </div>
        </div>
      )}

      <button className="organizer-back-btn" onClick={() => navigate(-1)}>
        <ArrowBackIcon /> Back 
      </button>

      {/* LEFT SIDE */}
      <div className="organizer-left">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        
        <div className="left-content">
          <div className="organizer-icon">
            <OrganizerIcon />
          </div>
          
          <div className="typing-container">
            <h2 className="typing-text">{typedText}</h2>
            <span className="cursor">|</span>
          </div>
          
          <div className="highlight-text">
            <p><GroupsIcon /> Join <strong>500+ organizations</strong> making a difference across Pakistan.</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon"><BadgeIcon /></div>
              <span>Post Volunteer Opportunities</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><GroupsIcon /></div>
              <span>Manage Volunteers Effectively</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><TrendingUpIcon /></div>
              <span>Track Impact & Analytics</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><VerifiedIcon /></div>
              <span>Get Verified & Trusted</span>
            </div>
          </div>

        
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="organizer-right">
        <div className="form-container">
          <div className="form-icon-wrapper">
            <div className="form-icon">
              <BusinessIcon />
            </div>
          </div>
          
          <h3 className="organizer-heading">Organizer Registration</h3>
          <h2 className="organizer-title">Register Your Organization</h2>
          <p className="form-subtitle">Admin approval required after submission</p>

          <div className="progress-wrapper">
            <LinearProgress variant="determinate" value={((step + 1) / steps.length) * 100} className="progress-bar" />
            <Typography variant="caption" className="progress-text">Step {step + 1} of {steps.length}</Typography>
          </div>

          <div className="step-indicators">
            {steps.map((s, idx) => (
              <div key={s.id} className="step-item" onClick={() => isStepComplete(idx) && idx < step && setStep(idx)}>
                <div className={`step-circle ${step === idx ? 'active' : (isStepComplete(idx) ? 'completed' : '')}`}>
                  {isStepComplete(idx) && idx !== step ? <DoneIcon /> : s.icon}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="organizer-form">
            {error && <Alert severity="error" className="error-alert">{error}</Alert>}
            
            <Fade in timeout={300} key={step}>
              <div>{renderStep()}</div>
            </Fade>

            <div className="form-buttons">
              <button className="back-btn" onClick={handleBack} disabled={step === 0 || loading}>
                <ArrowBackIcon /> Back
              </button>
              <button className="next-btn" onClick={handleNext} disabled={loading}>
                {loading ? 'Submitting...' : (step === steps.length - 1 ? 'Submit Application' : 'Continue')}
                {step !== steps.length - 1 && <ArrowForwardIcon />}
              </button>
            </div>

            <div className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Sign In</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}