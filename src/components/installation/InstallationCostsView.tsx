import { getRegionLabel } from '../../data/localeConfig';
import { installationCosts } from '../../data/installationCosts';
import type {
  InstallationCostCountry,
  InstallationCostLineItem,
  InstallationCostSection,
} from '../../types/installationCosts';

function PricingTable({
  section,
}: {
  section: InstallationCostSection;
}) {
  const hasPartNumber = section.fixedColumns.includes('Part Number');
  const countries = section.countries;

  return (
    <div className="overflow-x-auto border border-border rounded-sm">
      <table className="w-full min-w-[720px] text-sm border-collapse">
        <thead className="bg-surface-muted">
          <tr>
            {hasPartNumber ? (
              <>
                <th className="text-left px-4 py-3 font-semibold border-b border-border">Part Number</th>
                <th className="text-left px-4 py-3 font-semibold border-b border-border">Product Element</th>
                <th className="text-left px-4 py-3 font-semibold border-b border-border">UOM</th>
              </>
            ) : (
              <>
                <th className="text-left px-4 py-3 font-semibold border-b border-border">Product Element</th>
                <th className="text-left px-4 py-3 font-semibold border-b border-border">UOM</th>
              </>
            )}
            {countries.map((country) => (
              <th
                key={country.id}
                className="text-left px-4 py-3 font-semibold border-b border-border whitespace-nowrap"
              >
                {country.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.lineItems.map((item) => (
            <PricingRow
              key={item.id}
              item={item}
              hasPartNumber={hasPartNumber}
              countries={countries}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingRow({
  item,
  hasPartNumber,
  countries,
}: {
  item: InstallationCostLineItem;
  hasPartNumber: boolean;
  countries: InstallationCostCountry[];
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      {hasPartNumber ? (
        <>
          <td className="px-4 py-3 font-mono text-xs text-text-muted">{item.partNumber ?? '—'}</td>
          <td className="px-4 py-3 font-medium">{item.productElement}</td>
          <td className="px-4 py-3 text-text-muted">{item.uom}</td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 font-medium">{item.productElement}</td>
          <td className="px-4 py-3 text-text-muted">{item.uom}</td>
        </>
      )}
      {countries.map((country) => (
        <td key={country.id} className="px-4 py-3 font-mono text-xs whitespace-nowrap">
          {item.pricing[country.id]?.value ?? '—'}
        </td>
      ))}
    </tr>
  );
}

export function InstallationCostsView() {
  return (
    <div className="space-y-8">
      <div className="border border-border rounded-sm bg-surface p-5">
        <h2 className="text-xl font-bold m-0 mb-2">Installation Costs</h2>
        <p className="text-sm text-text-muted m-0 leading-relaxed">
          Complete Smart Build pricing from the Accessories Price List, organized by region. Each
          table includes all countries listed for EMEA, AMER, and APAC in the installation costs
          worksheet.
        </p>
      </div>

      {installationCosts.regions.map((region) => (
        <section key={region.id} className="space-y-5">
          <div>
            <h3 className="text-lg font-bold m-0">{getRegionLabel(region.id)}</h3>
            <p className="text-sm text-text-muted m-0 mt-1">
              {region.sections.length} pricing section(s) for {region.name}
            </p>
          </div>

          {region.sections.map((section) => (
            <article
              key={section.id}
              className="border border-border rounded-sm bg-surface p-5 space-y-4"
            >
              <div>
                <h4 className="text-base font-bold m-0">{section.title}</h4>
                {section.billingType ? (
                  <p className="text-xs font-mono text-brand-red m-0 mt-1">
                    Billing type: {section.billingType}
                  </p>
                ) : null}
              </div>

              {section.notes?.map((note) => (
                <div
                  key={note.title}
                  className="rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"
                >
                  <p className="font-semibold m-0 mb-1">{note.title}</p>
                  <p className="m-0 leading-relaxed">{note.text}</p>
                </div>
              ))}

              <PricingTable section={section} />
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
