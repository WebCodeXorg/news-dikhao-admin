"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Shield, Users, AlertTriangle } from "lucide-react"
import { DEV_CONFIG } from "@/lib/dev-config"

export default function DevSettings() {
  const [config, setConfig] = useState(DEV_CONFIG)

  const updateConfig = (key: keyof typeof DEV_CONFIG, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    // In a real app, you'd save this to localStorage or a config file
    console.log("Config updated:", key, value)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white font-hindi flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Development Settings
            </CardTitle>
            <p className="text-gray-400 font-hindi">Temporary development configurations for testing</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-hindi">Development Mode</Label>
                    <p className="text-sm text-gray-400">Enable development features</p>
                  </div>
                  <Switch
                    checked={config.ENABLE_DEV_MODE}
                    onCheckedChange={(checked) => updateConfig("ENABLE_DEV_MODE", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-hindi">Bypass Authentication</Label>
                    <p className="text-sm text-gray-400">Accept any credentials for login</p>
                  </div>
                  <Switch
                    checked={config.BYPASS_AUTH}
                    onCheckedChange={(checked) => updateConfig("BYPASS_AUTH", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-hindi">Enable Sign Up</Label>
                    <p className="text-sm text-gray-400">Show sign up functionality</p>
                  </div>
                  <Switch
                    checked={config.ENABLE_SIGNUP}
                    onCheckedChange={(checked) => updateConfig("ENABLE_SIGNUP", checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-hindi font-semibold mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Default Admin
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Email: {config.DEFAULT_ADMIN.email}
                    <br />
                    Password: {config.DEFAULT_ADMIN.password}
                  </p>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-hindi font-semibold mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Dev Admin
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Email: {config.DEV_ADMIN.email}
                    <br />
                    Password: {config.DEV_ADMIN.password}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">Security Warning</span>
              </div>
              <p className="text-yellow-300 text-sm font-hindi">
                ⚠️ ये settings केवल development के लिए हैं। Production में इन्हें disable करना जरूरी है।
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-hindi font-semibold">How to Revert to Production:</h4>
              <ol className="text-gray-300 text-sm space-y-1 font-hindi">
                <li>1. DEV_CONFIG.ENABLE_DEV_MODE = false</li>
                <li>2. DEV_CONFIG.BYPASS_AUTH = false</li>
                <li>3. DEV_CONFIG.ENABLE_SIGNUP = false</li>
                <li>4. Remove dev-config.ts file</li>
                <li>5. Update admin-auth.ts to remove dev mode checks</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
