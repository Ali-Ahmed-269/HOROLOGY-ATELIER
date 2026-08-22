'use client'
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class PostProcessingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('CHRONOS ATELIER — Post-processing disabled due to WebGL context loss/HMR reload:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return null // Graceful degradation: scene renders raw 3D geometry without post-effects
    }
    return this.props.children
  }
}
