"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const maintenanceFormSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z
    .string()
    .min(10, {
      message: "Maintenance message must be at least 10 characters.",
    })
    .optional(),
  scheduledMaintenance: z.boolean().default(false),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allowAdminAccess: z.boolean().default(true),
  showCountdown: z.boolean().default(true),
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

const defaultValues: Partial<MaintenanceFormValues> = {
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon!",
  scheduledMaintenance: false,
  startDate: new Date().toISOString().split("T")[0],
  startTime: "22:00",
  endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
  endTime: "02:00",
  allowAdminAccess: true,
  showCountdown: true,
}

export function MaintenanceSettings() {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: MaintenanceFormValues) {
    toast({
      title: "Maintenance settings updated",
      description: "Your maintenance settings have been updated successfully.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
          <CardDescription>Configure maintenance mode settings for your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Maintenance Mode</FormLabel>
                      <FormDescription>Put your site in maintenance mode to prevent user access</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("maintenanceMode") && (
                <>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Enabling maintenance mode will make your site inaccessible to regular users. Only administrators
                      will be able to access the site.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="maintenanceMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the message to display during maintenance"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>This message will be displayed to users during maintenance</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowAdminAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Allow Admin Access</FormLabel>
                          <FormDescription>Allow administrators to access the site during maintenance</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Separator />

              <FormField
                control={form.control}
                name="scheduledMaintenance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Schedule Maintenance</FormLabel>
                      <FormDescription>Schedule maintenance for a future date and time</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("scheduledMaintenance") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="showCountdown"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Countdown</FormLabel>
                          <FormDescription>Display a countdown timer until maintenance ends</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Maintenance Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {form.watch("maintenanceMode") && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Page Preview</CardTitle>
            <CardDescription>Preview of the maintenance page that will be shown to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <h2 className="text-xl font-bold">Site Under Maintenance</h2>
              <p className="max-w-md">{form.watch("maintenanceMessage")}</p>

              {form.watch("scheduledMaintenance") && form.watch("showCountdown") && (
                <div className="mt-4 p-4 bg-muted rounded-md flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    We'll be back online in: <strong>4 hours 30 minutes</strong>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

