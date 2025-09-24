"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AddCardForm() {
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <div className="bg-white rounded-2xl p-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-10 leading-[46px] font-[DM-Sans]">Add card</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-normal font-[DM-Sans]">Card details</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="cardholderName"
                className="block text-sm text-[#2B3674] mb-4
                font-[Montserrat]
                font-semibold
                leading-[100%]
                tracking-[-0.02em]
              "
              >
                Cardholder's name
              </label>
              <Input
                id="cardholderName"
                placeholder="Seen on your card"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                className="h-12 bg-white placeholder:text-[#A3AED0]
                  placeholder:font-montserrat placeholder:font- placeholder:text-[14px] placeholder:leading-[100%] placeholder:tracking-[-0.02em]
                  "
              />
            </div>

            <div>
              <label
                htmlFor="cardholderName"
                className="block text-sm text-[#2B3674] mb-4
                  font-[Montserrat]
                font-semibold
                leading-[100%]
                tracking-[-0.02em]
              "
              >
                Card number
              </label>
              <Input
                id="cardNumber"
                placeholder="Seen on your card"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                className="h-12 bg-white placeholder:text-[#A3AED0]
                  placeholder:font-montserrat placeholder:font- placeholder:text-[14px] placeholder:leading-[100%] placeholder:tracking-[-0.02em]
                  "
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                htmlFor="cardholderName"
                className="block text-sm text-[#2B3674] mb-4
                  font-[Montserrat]
                font-semibold
                leading-[100%]
                tracking-[-0.02em]
              "
              >
                  Expiry
                </label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={(e) => handleInputChange("expiry", e.target.value)}
                  className="h-12 bg-white placeholder:text-[#A3AED0]
                  placeholder:font-montserrat placeholder:font- placeholder:text-[14px] placeholder:leading-[100%] placeholder:tracking-[-0.02em]
                  "
                />
              </div>
              <div>
                <label
                htmlFor="cardholderName"
                className="block text-sm text-[#2B3674] mb-4
                
                font-semibold
                leading-[100%]
                tracking-[-0.02em]
              "
              >
                  CVC
                </label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) => handleInputChange("cvc", e.target.value)}
                  className="h-12 bg-white placeholder:text-[#A3AED0]
                  placeholder:font-montserrat placeholder:font- placeholder:text-[14px] placeholder:leading-[100%] placeholder:tracking-[-0.02em]
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="customBlue"
          className="w-full h-12 text-white font-medium rounded-lg font-semibold leading-[115%] tracking-[0] text-md"
          size="lg"
        >
          Next
        </Button>
      </form>
    </div>
  )
}
