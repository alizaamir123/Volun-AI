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
import { useAuthStore } from '../../state/authStore'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  LocationCity as LocationCityIcon,
  LinkedIn as LinkedInIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Favorite as FavoriteIcon,
  VolunteerActivism as VolunteerIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Done as DoneIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import './VolunteerSignupPage.css'

const provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'ICT']
const presetSkills = ['Excel', 'Accounts', 'Data Entry', 'Teaching', 'Healthcare', 'Social Media']
const presetInterests = ['Education', 'Healthcare', 'Environment', 'Community Service', 'Technology', 'Social Work']
const availabilitySlots = ['Morning (9-12)', 'Afternoon (12-3)', 'Evening (3-6)', 'Night (6-9)']

const schema = yup.object({
  fullName: yup.string().required('Required').min(3, 'Min 3 chars'),
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(8, 'Min 8 chars').matches(/[A-Z]/, '1 uppercase').matches(/[a-z]/, '1 lowercase').matches(/[0-9]/, '1 number').required('Required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
  phoneNumber: yup.string().required('Required').matches(/^[0-9]{10,13}$/, '10-13 digits'),
  city: yup.string().required('Required'),
  province: yup.string().required('Required'),
  linkedin: yup.string().url('Invalid URL').optional(),
})

export function VolunteerSignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [showParticles, setShowParticles] = useState(true)
  
  const [skills, setSkills] = useState([])
  const [customSkill, setCustomSkill] = useState('')
  const [interests, setInterests] = useState([])
  const [customInterest, setCustomInterest] = useState('')
  const [availability, setAvailability] = useState([])

  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm({ 
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '', email: '', password: '', confirmPassword: '',
      phoneNumber: '', city: '', province: provinces[0], linkedin: '',
    }
  })

  const watchAll = watch()

  // Typing Animation Effect - Chota size
  useEffect(() => {
    const fullText = "Make a Difference in community"
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Particles Effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (showParticles) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animationDuration = Math.random() * 3 + 2 + 's'
        particle.style.width = particle.style.height = Math.random() * 8 + 4 + 'px'
        document.querySelector('.particles-container')?.appendChild(particle)
        setTimeout(() => particle.remove(), 5000)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [showParticles])

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000)
    const observerOptions = { threshold: 0.2 }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const steps = [
    { id: 0, label: 'Basic', icon: <PersonIcon />, fields: ['fullName', 'email', 'phoneNumber', 'linkedin'] },
    { id: 1, label: 'Security', icon: <LockIcon />, fields: ['password', 'confirmPassword'] },
    { id: 2, label: 'Location', icon: <LocationCityIcon />, fields: ['city', 'province'] },
    { id: 3, label: 'Interests', icon: <FavoriteIcon />, fields: [] },
    { id: 4, label: 'Skills', icon: <BuildIcon />, fields: [] },
    { id: 5, label: 'Time', icon: <ScheduleIcon />, fields: [] },
  ]

  const isStepComplete = (stepId) => {
    if (stepId === 0) return watchAll.fullName && watchAll.email && watchAll.phoneNumber
    if (stepId === 1) return watchAll.password && watchAll.confirmPassword && watchAll.password === watchAll.confirmPassword && watchAll.password?.length >= 8
    if (stepId === 2) return watchAll.city && watchAll.province
    if (stepId === 3) return interests.length > 0
    if (stepId === 4) return skills.length > 0
    if (stepId === 5) return availability.length > 0
    return false
  }

  const handleNext = async () => {
    const currentStep = steps[step]
    if (currentStep.fields.length > 0) {
      const isValid = await trigger(currentStep.fields)
      if (!isValid) return
    }
    
    if (step === 3 && interests.length === 0) { setError('Select at least one interest'); return }
    if (step === 4 && skills.length === 0) { setError('Select at least one skill'); return }
    if (step === 5 && availability.length === 0) { setError('Select availability'); return }
    
    setError(null)
    if (step === 5) await onSubmit()
    else setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const addSkill = (s) => !skills.includes(s) && setSkills([...skills, s])
  const removeSkill = (s) => setSkills(skills.filter(i => i !== s))
  const addCustomSkill = () => { 
    if (customSkill.trim() && !skills.includes(customSkill.trim())) { 
      setSkills([...skills, customSkill.trim()]); 
      setCustomSkill('') 
    } 
  }
  
  const addInterest = (i) => !interests.includes(i) && setInterests([...interests, i])
  const removeInterest = (i) => setInterests(interests.filter(x => x !== i))
  const addCustomInterest = () => { 
    if (customInterest.trim() && !interests.includes(customInterest.trim())) { 
      setInterests([...interests, customInterest.trim()]); 
      setCustomInterest('') 
    } 
  }
  
  const toggleAvailability = (slot) => setAvailability(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const payload = {
        email: values.email, password: values.password, full_name: values.fullName,
        phone_number: values.phoneNumber, city: values.city, province: values.province,
        skills: skills.join(', '), interests: interests.join(', '), availability: availability.join(', '),
        linkedin: values.linkedin,
      }
      const res = await api.post('/api/v1/auth/register/volunteer', payload)
      setSession(res.data.access_token, { id: res.data.user.id, role: res.data.user.role, fullName: res.data.user.full_name, email: res.data.user.email })
      enqueueSnackbar(' Account created successfully!', { variant: 'success' })
      navigate('/volunteer', { replace: true })
    } catch (e) { 
      setError(errorMessage(e, 'Signup failed')) 
    } finally { 
      setLoading(false) 
    }
  })

  const renderStep = () => {
    switch(step) {
      case 0: 
        return (
          <Zoom in timeout={400}>
            <div>
              <div className="form-row">
                <TextField size="small" fullWidth label="Full Name" {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} InputProps={{ startAdornment: <PersonIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} InputProps={{ startAdornment: <EmailIcon className="field-icon" /> }} />
              </div>
              <div className="form-row" style={{ marginTop: 16 }}>
                <TextField size="small" fullWidth label="Phone Number" {...register('phoneNumber')} error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} InputProps={{ startAdornment: <PhoneIcon className="field-icon" /> }} />
                <TextField size="small" fullWidth label="LinkedIn (Optional)" {...register('linkedin')} error={!!errors.linkedin} helperText={errors.linkedin?.message} InputProps={{ startAdornment: <LinkedInIcon className="field-icon" /> }} />
              </div>
            </div>
          </Zoom>
        )
      case 1:
        return (
          <Zoom in timeout={400}>
            <div className="form-row">
              <TextField size="small" fullWidth label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} InputProps={{ startAdornment: <LockIcon className="field-icon" /> }} />
              <TextField size="small" fullWidth label="Confirm Password" type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} InputProps={{ startAdornment: <LockIcon className="field-icon" /> }} />
            </div>
          </Zoom>
        )
      case 2:
        return (
          <Zoom in timeout={400}>
            <div className="form-row">
              <TextField size="small" fullWidth label="City" {...register('city')} error={!!errors.city} helperText={errors.city?.message} InputProps={{ startAdornment: <LocationCityIcon className="field-icon" /> }} />
              <TextField size="small" fullWidth select label="Province" defaultValue={provinces[0]} {...register('province')} error={!!errors.province} helperText={errors.province?.message}>
                {provinces.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </div>
          </Zoom>
        )
      case 3:
        return (
          <Slide direction="up" in timeout={400}>
            <div>
              <div className="section-title">
                <FavoriteIcon className="section-icon" />
                YOUR INTERESTS
              </div>
              <div className="chips-container">
                {presetInterests.map(i => (
                  <Chip 
                    key={i} 
                    label={i} 
                    onClick={() => addInterest(i)} 
                    className={interests.includes(i) ? 'chip-active' : 'chip'} 
                  />
                ))}
              </div>
              <div className="custom-input-row">
                <TextField size="small" placeholder="Add custom interest..." value={customInterest} onChange={e => setCustomInterest(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomInterest()} fullWidth InputProps={{ startAdornment: <FavoriteIcon className="field-icon" /> }} />
                <Button size="small" onClick={addCustomInterest} className="add-btn">Add +</Button>
              </div>
              {interests.length > 0 && (
                <div className="selected-items">
                  <div className="selected-label"> Your Interests ({interests.length})</div>
                  {interests.map(i => (
                    <Chip key={i} label={i} onDelete={() => removeInterest(i)} size="small" className="selected-chip" />
                  ))}
                </div>
              )}
            </div>
          </Slide>
        )
      case 4:
        return (
          <Slide direction="up" in timeout={400}>
            <div>
              <div className="section-title">
                <BuildIcon className="section-icon" />
                YOUR SKILLS
              </div>
              <div className="chips-container">
                {presetSkills.map(s => (
                  <Chip 
                    key={s} 
                    label={s} 
                    onClick={() => addSkill(s)} 
                    className={skills.includes(s) ? 'chip-active' : 'chip'} 
                  />
                ))}
              </div>
              <div className="custom-input-row">
                <TextField size="small" placeholder="Add custom skill..." value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomSkill()} fullWidth InputProps={{ startAdornment: <BuildIcon className="field-icon" /> }} />
                <Button size="small" onClick={addCustomSkill} className="add-btn">Add +</Button>
              </div>
              {skills.length > 0 && (
                <div className="selected-items">
                  <div className="selected-label"> Your Skills ({skills.length})</div>
                  {skills.map(s => (
                    <Chip key={s} label={s} onDelete={() => removeSkill(s)} size="small" className="selected-chip" icon={<CheckCircleIcon />} />
                  ))}
                </div>
              )}
            </div>
          </Slide>
        )
      case 5:
        return (
          <Slide direction="up" in timeout={400}>
            <div>
              <div className="section-title">
                <ScheduleIcon className="section-icon" />
                AVAILABILITY SLOTS
              </div>
              <div className="chips-container">
                {availabilitySlots.map(slot => (
                  <Chip 
                    key={slot} 
                    label={slot} 
                    onClick={() => toggleAvailability(slot)} 
                    className={availability.includes(slot) ? 'chip-active' : 'chip'} 
                  />
                ))}
              </div>
              {availability.length > 0 && (
                <div className="selected-items">
                  <div className="selected-label"> Your Availability ({availability.length})</div>
                  {availability.map(slot => (
                    <Chip key={slot} label={slot} onDelete={() => toggleAvailability(slot)} size="small" className="selected-chip" />
                  ))}
                </div>
              )}
            </div>
          </Slide>
        )
      default: 
        return <div>Loading...</div>
    }
  }

  return (
    <div className="volunteer-signup-wrapper">
      {/* Particles Container */}
      <div className="particles-container"></div>

      {/* Welcome Animation */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <CelebrationIcon className="welcome-icon" />
            <h2>Welcome to VolunAI! </h2>
            <p>Let's start your volunteering journey</p>
          </div>
        </div>
      )}

      <button className="volunteer-back-btn" onClick={() => navigate(-1)}>
        <ArrowBackIcon /> Back 
      </button>

      {/* LEFT SIDE - Stylish Content */}
      <div className="volunteer-left animate-on-scroll">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        
        <div className="left-content">
          <div className="volunteer-icon">
            <VolunteerIcon />
          </div>
          
          <div className="typing-container">
            <h2 className="typing-text">{typedText}</h2>
            <span className="cursor">|</span>
          </div>
          
          <div className="highlight-text">
            <p>Join <strong>10,000+ volunteers</strong> creating positive change across Pakistan. Your small act of kindness can change someone's life forever.</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon"><CheckCircleIcon /></div>
              <span>Find Meaningful Opportunities</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircleIcon /></div>
              <span>Connect with Like-minded People</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircleIcon /></div>
              <span>Track Your Impact & Hours</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircleIcon /></div>
              <span>Earn Recognition & Certificates</span>
            </div>
          </div>

          

          
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="volunteer-right animate-on-scroll">
        <div className="form-container">
          <div className="form-icon-wrapper">
            <div className="form-icon">
              <PersonIcon />
            </div>
          </div>
          
          <h3 className="volunteer-heading">Volunteer Registration</h3>
          <h2 className="volunteer-title">Create Your Profile</h2>
          <p className="form-subtitle">Fill in your details to get started</p>

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

          <div className="volunteer-form">
            {error && <Alert severity="error" className="error-alert">{error}</Alert>}
            
            <Fade in timeout={300} key={step}>
              <div>{renderStep()}</div>
            </Fade>

            <div className="form-buttons">
              <button className="back-btn" onClick={handleBack} disabled={step === 0 || loading}>
                <ArrowBackIcon /> Back
              </button>
              <button className="next-btn" onClick={handleNext} disabled={loading}>
                {loading ? 'Creating...' : (step === 5 ? 'Create Account ' : 'Continue')}
                {step !== 5 && <ArrowForwardIcon />}
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