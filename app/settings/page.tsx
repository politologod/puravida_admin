"use client"

import { useState } from "react"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { SettingsSidebar } from "../../components/settings/settings-sidebar"
import { ProfileSettings } from "../../components/settings/profile-settings"
import { CurrencySettings } from "../../components/settings/currency-settings"
import { TimezoneSettings } from "../../components/settings/timezone-settings"
import { DeliverySettings } from "../../components/settings/delivery-settings"
import { MaintenanceSettings } from "../../components/settings/maintenance-settings"
import { UserManagementSettings } from "../../components/settings/user-management-settings"
import { HeroCarouselSettings } from "../../components/settings/hero-carousel-settings"
import { EcommerceSettings } from "../../components/settings/ecommerce-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col md:flex-row">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your system configuration</p>
              </div>

              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "ecommerce" && <EcommerceSettings />}
              {activeTab === "currency" && <CurrencySettings />}
              {activeTab === "timezone" && <TimezoneSettings />}
              {activeTab === "delivery" && <DeliverySettings />}
              {activeTab === "maintenance" && <MaintenanceSettings />}
              {activeTab === "users" && <UserManagementSettings />}
              {activeTab === "hero" && <HeroCarouselSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

