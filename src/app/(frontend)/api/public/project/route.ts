import { NextResponse } from 'next/server'

import {
  getActivities,
  getIndicators,
  getPartners,
  getProject,
  getSatisfaction,
  getVideos,
} from '@/content/project'
import { getPayloadClient } from '@/content/payload'

/**
 * The whole project record in one response: report facts, activities with their
 * consent-cleared photographs, indicators, satisfaction summary, partners and
 * videos. Ownership links live on /api/public/site-settings, as before.
 */
export async function GET() {
  const [project, activities, indicators, satisfaction, partners, videos, payload] =
    await Promise.all([
      getProject(),
      getActivities(),
      getIndicators(),
      getSatisfaction(),
      getPartners(),
      getVideos(),
      getPayloadClient(),
    ])

  const facts = await payload.findGlobal({ slug: 'project-facts', depth: 0 })

  return NextResponse.json({
    data: {
      nameTh: project.nameTh,
      shortName: project.shortName,
      nameEn: project.nameEn,
      tagline: project.tagline,
      owner: project.owner,
      funder: project.funder,
      period: project.period,
      fiscalYear: project.fiscalYear,
      strategy: project.strategy,
      budgetTHB: project.budgetTHB,
      budgetCode: project.budgetCode,
      leads: project.leads,
      reportDate: project.reportDate,
      objectives: project.objectives,
      recommendations: project.recommendations,
      bibliography: project.bibliography,
      safetyNotice: project.safetyNotice,
      activities,
      indicators,
      satisfaction,
      partners,
      videos,
      updatedAt: facts.updatedAt,
    },
  })
}
