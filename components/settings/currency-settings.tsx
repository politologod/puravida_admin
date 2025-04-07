"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Info, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const currencyFormSchema = z.object({
  primaryCurrency: z.string({
    required_error: "Please select a primary currency.",
  }),
  secondaryCurrency: z.string({
    required_error: "Please select a secondary currency.",
  }),
  exchangeRate: z.coerce.number().positive({
    message: "Exchange rate must be a positive number.",
  }),
  autoUpdate: z.boolean().default(false),
  apiKey: z.string().optional(),
  showBothCurrencies: z.boolean().default(true),
  roundPrices: z.boolean().default(false),
})

type CurrencyFormValues = z.infer<typeof currencyFormSchema>

const defaultValues: Partial<CurrencyFormValues> = {
  primaryCurrency: "USD",
  secondaryCurrency: "VES",
  exchangeRate: 36.12,
  autoUpdate: true,
  apiKey: "your-exchange-rate-api-key",
  showBothCurrencies: true,
  roundPrices: true,
}

export function CurrencySettings() {
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues,
  })

  function onSubmit(data: CurrencyFormValues) {
    toast({
      title: "Currency settings updated",
      description: "Your currency settings have been updated successfully.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Configure how currencies are displayed and managed in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="primaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="VES">Venezuelan Bolívar Soberano (VES)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The main currency used for transactions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select secondary currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="VES">Venezuelan Bolívar Soberano (VES)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The alternative currency for display</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Exchange Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How many units of secondary currency equal 1 unit of primary currency</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" step="0.01" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Current rate: 1 USD = {form.watch("exchangeRate")} VES</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoUpdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-update Exchange Rate</FormLabel>
                        <FormDescription>Automatically update exchange rates daily</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("autoUpdate") && (
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your API key" {...field} />
                      </FormControl>
                      <FormDescription>API key for automatic exchange rate updates</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="showBothCurrencies"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Both Currencies</FormLabel>
                        <FormDescription>Display prices in both primary and secondary currencies</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roundPrices"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Round Prices</FormLabel>
                        <FormDescription>Round converted prices to nearest whole number</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Currency Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency Preview</CardTitle>
          <CardDescription>See how your prices will be displayed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Product Price Display</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Primary Currency:</span>
                  <span className="font-bold">$15.99</span>
                </div>
                {form.watch("showBothCurrencies") && (
                  <div className="flex items-center justify-between">
                    <span>Secondary Currency:</span>
                    <span className="text-muted-foreground">
                      {form.watch("roundPrices")
                        ? `${Math.round(15.99 * form.watch("exchangeRate"))} VES`
                        : `${(15.99 * form.watch("exchangeRate")).toFixed(2)} VES`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Order Total Display</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Primary Currency:</span>
                  <span className="font-bold">$127.50</span>
                </div>
                {form.watch("showBothCurrencies") && (
                  <div className="flex items-center justify-between">
                    <span>Secondary Currency:</span>
                    <span className="text-muted-foreground">
                      {form.watch("roundPrices")
                        ? `${Math.round(127.5 * form.watch("exchangeRate"))} VES`
                        : `${(127.5 * form.watch("exchangeRate")).toFixed(2)} VES`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

