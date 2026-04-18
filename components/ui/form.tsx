"use client"

import * as React from "react"
import {
    Controller,
    FormProvider,
    useFormContext,
} from "react-hook-form"

export const Form = FormProvider

export const FormField = Controller

export const FormItem = ({ children }: { children: React.ReactNode }) => {
    return <div className="space-y-2">{children}</div>
}

export const FormLabel = ({ children }: { children: React.ReactNode }) => {
    return <label className="text-sm font-medium">{children}</label>
}

export const FormControl = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
}

export const FormDescription = ({ children }: { children: React.ReactNode }) => {
    return <p className="text-sm text-gray-500">{children}</p>
}

export const FormMessage = () => {
    const { formState } = useFormContext()
    const error = Object.values(formState.errors)[0]

    if (!error) return null

    return <p className="text-sm text-red-500">{String(error.message)}</p>
}