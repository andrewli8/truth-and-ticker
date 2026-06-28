import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PocApp } from './PocApp'
import './poc.css'

const root = document.getElementById('poc-root')
if (root) createRoot(root).render(<StrictMode><PocApp /></StrictMode>)
