"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function TaxesPage() {
  useEffect(() => {
    redirect("/settings?tab=taxes")
  }, [])
  
  return null
} 