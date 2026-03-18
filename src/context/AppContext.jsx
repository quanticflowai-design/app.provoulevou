import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, PLANOS, getLimitePlano } from '../services/supabase'

const AppContext = createContext(null)

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: '', show: false })

  // Toast helper
  const showToast = useCallback((msg, type = 'default') => {
    setToast({ msg, type, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }, [])

  // Load user profile from Supabase (or mock)
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) { setProfile(null); return }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Create profile if not exists
        const { data: newProfile } = await supabase
          .from('users')
          .insert([{ id: authUser.id, email: authUser.email, plano: 'starter', fotos_usadas: 0 }])
          .select()
          .single()
        setProfile(newProfile)
      } else if (data) {
        setProfile(data)
      }
    } catch {
      // Fallback mock profile (when Supabase not configured)
      setProfile({
        id: authUser.id,
        email: authUser.email,
        plano: 'starter',
        fotos_usadas: 0,
      })
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null).finally(() => setLoading(false))
    }).catch(() => setLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // Mock login for demo (when Supabase not configured)
  const mockLogin = useCallback(() => {
    const mockUser = { id: 'mock-user-id', email: 'demo@provoulevou.com' }
    setUser(mockUser)
    setProfile({ id: 'mock-user-id', email: 'demo@provoulevou.com', plano: 'starter', fotos_usadas: 0 })
  }, [])

  const canUseProvador = profile
    ? profile.fotos_usadas < getLimitePlano(profile.plano)
    : true

  const fotosRestantes = profile
    ? getLimitePlano(profile.plano) - profile.fotos_usadas
    : 50

  const planoAtual = profile ? PLANOS[profile.plano] : PLANOS.starter

  return (
    <AppContext.Provider value={{
      user,
      profile,
      setProfile,
      loading,
      menuOpen,
      setMenuOpen,
      toast,
      showToast,
      mockLogin,
      canUseProvador,
      fotosRestantes,
      planoAtual,
      PLANOS,
    }}>
      {children}
    </AppContext.Provider>
  )
}
