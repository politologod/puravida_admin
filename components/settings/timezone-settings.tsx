"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

const timezoneFormSchema = z.object({
  timezone: z.string({
    required_error: "Please select a timezone.",
  }),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], {
    required_error: "Please select a date format.",
  }),
  timeFormat: z.enum(["12h", "24h"], {
    required_error: "Please select a time format.",
  }),
  autoDetect: z.boolean().default(false),
})

type TimezoneFormValues = z.infer<typeof timezoneFormSchema>

const defaultValues: Partial<TimezoneFormValues> = {
  timezone: "America/Caracas",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  autoDetect: false,
}

// Sample timezone options
const timezones = [
  { value: "America/Caracas", label: "Caracas (GMT-04:00)" },
  { value: "America/New_York", label: "New York (GMT-05:00)" },
  { value: "America/Chicago", label: "Chicago (GMT-06:00)" },
  { value: "America/Denver", label: "Denver (GMT-07:00)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-08:00)" },
  { value: "Europe/London", label: "London (GMT+00:00)" },
  { value: "Europe/Paris", label: "Paris (GMT+01:00)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+09:00)" },
]

export function TimezoneSettings() {
  const form = useForm<TimezoneFormValues>({
    resolver: zodResolver(timezoneFormSchema),
    defaultValues,
  })

  function onSubmit(data: TimezoneFormValues) {
    toast({
      title: "Timezone settings updated",
      description: "Your timezone settings have been updated successfully.",
    })
    console.log(data)
  }

  // Get current date and time for preview
  const now = new Date()

  // Format date based on selected format
  const formatDate = (date: Date, format: string) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    switch (format) {
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  // Format time based on selected format
  const formatTime = (date: Date, format: string) => {
    const hours24 = date.getHours()
    const hours12 = hours24 % 12 || 12
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours24 >= 12 ? "PM" : "AM"

    return format === "12h" ? `${hours12}:${minutes} ${ampm}` : `${hours24.toString().padStart(2, "0")}:${minutes}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timezone Settings</CardTitle>
          <CardDescription>Configure how dates and times are displayed in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="autoDetect"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-detect Timezone</FormLabel>
                      <FormDescription>Automatically detect timezone based on user's browser</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("autoDetect") && (
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>The timezone used for all date and time displays</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Date Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="MM/DD/YYYY" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            MM/DD/YYYY (e.g., {formatDate(now, "MM/DD/YYYY")})
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="DD/MM/YYYY" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            DD/MM/YYYY (e.g., {formatDate(now, "DD/MM/YYYY")})
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="YYYY-MM-DD" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            YYYY-MM-DD (e.g., {formatDate(now, "YYYY-MM-DD")})
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFormat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Time Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="12h" />
                          </FormControl>
                          <FormLabel className="font-normal">12-hour (e.g., {formatTime(now, "12h")})</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="24h" />
                          </FormControl>
                          <FormLabel className="font-normal">24-hour (e.g., {formatTime(now, "24h")})</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Timezone Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Date and Time</CardTitle>
          <CardDescription>Preview of your date and time settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Current Date and Time:</span>
            </div>
            <div className="font-medium">
              {formatDate(now, form.watch("dateFormat"))} {formatTime(now, form.watch("timeFormat"))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

