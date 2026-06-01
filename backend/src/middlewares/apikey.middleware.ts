import { NextFunction, Request, Response } from "express"
import { env } from "@configs"

export const MApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apikey = req.headers.apikey as string
    const contentTypeOptions = req.headers["x-content-type-options"] as string
    const xssProtection = req.headers["x-xss-protection"] as string
    const strictTransportSecurity = req.headers["strict-transport-security"] as string
    const frameOptions = req.headers["x-frame-options"] as string

    // Validate API Key
    if (!apikey) {
      return res.status(401).json({
        status: false,
        message: "API Key is required",
      })
    }

    if (apikey !== env.APIKEY) {
      return res.status(403).json({
        status: false,
        message: "Invalid API Key",
      })
    }

    // Validate Security Headers
    if (contentTypeOptions !== "nosniff") {
      return res.status(400).json({
        status: false,
        message: "Invalid x-content-type-options header",
      })
    }

    if (xssProtection !== "1; mode=block") {
      return res.status(400).json({
        status: false,
        message: "Invalid x-xss-protection header",
      })
    }

    if (strictTransportSecurity !== "max-age=31536000; includeSubDomains; preload") {
      return res.status(400).json({
        status: false,
        message: "Invalid strict-transport-security header",
      })
    }

    if (frameOptions !== "SAMEORIGIN") {
      return res.status(400).json({
        status: false,
        message: "Invalid x-frame-options header",
      })
    }

    console.log("ALL HEADER CORRECT", {
      apikey,
      contentTypeOptions,
      xssProtection,
      strictTransportSecurity,
      frameOptions,
    })

    next()
  } catch (e: any) {
    console.log("ERROR API KEY: ", e)
    return res.status(401).json({
      status: false,
      message: "API Key validation failed",
    })
  }
}
