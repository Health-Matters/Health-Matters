import { useMemo, useState } from "react";
import { Download, ExternalLink, Filter, Search } from "lucide-react";

const DOCUMENTS = [
  {
    id: "doc-1",
    title: "Early Signs of Workplace Stress",
    topic: "Mental Health",
    serviceType: "Mental Health & Wellbeing",
    category: "advice_sheet",
    isPublic: true,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    summary: "Quick guide for spotting stress signals and initial manager support actions.",
  },
  {
    id: "doc-2",
    title: "Manager Referral Best Practice",
    topic: "Referral Guidance",
    serviceType: "Occupational Health",
    category: "public_doc",
    isPublic: true,
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    summary: "How to create complete and actionable referrals for occupational health teams.",
  },
  {
    id: "doc-3",
    title: "Musculoskeletal Advice Sheet",
    topic: "Physical Health",
    serviceType: "Physiotherapy",
    category: "advice_sheet",
    isPublic: true,
    pdfUrl: "https://www.africau.edu/images/default/sample.pdf",
    summary: "Practical advice for managing musculoskeletal concerns in desk and manual roles.",
  },
  {
    id: "doc-4",
    title: "Ergonomic Workplace Checklist",
    topic: "Workstation",
    serviceType: "Ergonomic Assessment",
    category: "public_doc",
    isPublic: true,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    summary: "Checklist for assessing workstation setup and reducing physical strain.",
  },
];

export const ManagerTestBudget = () => {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [activeId, setActiveId] = useState(DOCUMENTS[0]?.id || null);

  const topics = useMemo(
    () => ["all", ...Array.from(new Set(DOCUMENTS.filter((doc) => doc.isPublic).map((doc) => doc.topic)))],
    []
  );
  const serviceTypes = useMemo(
    () => ["all", ...Array.from(new Set(DOCUMENTS.filter((doc) => doc.isPublic).map((doc) => doc.serviceType)))],
    []
  );

  const filteredDocs = DOCUMENTS.filter((doc) => {
    if (!doc.isPublic) return false;

    const text = `${doc.title} ${doc.summary} ${doc.topic} ${doc.serviceType}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesTopic = topicFilter === "all" || doc.topic === topicFilter;
    const matchesService = serviceFilter === "all" || doc.serviceType === serviceFilter;

    return matchesSearch && matchesTopic && matchesService;
  });

  const activeDoc = filteredDocs.find((doc) => doc.id === activeId) || filteredDocs[0] || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Health Guidance Library</h1>
        <p className="mt-1 text-sm text-slate-500">Search public guidance documents and advice sheets to proactively support your team.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents, topics, or service type..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Topic</label>
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === "all" ? "All Topics" : topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Service Type</label>
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {serviceTypes.map((serviceType) => (
                <option key={serviceType} value={serviceType}>
                  {serviceType === "all" ? "All Services" : serviceType}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" /> {filteredDocs.length} public document(s)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Document Library</h2>
          </div>

          <div className="max-h-155 space-y-3 overflow-y-auto p-4">
            {filteredDocs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No documents match your search/filter.
              </p>
            ) : (
              filteredDocs.map((doc) => {
                const active = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveId(doc.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{doc.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${doc.category === "advice_sheet" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                        {doc.category === "advice_sheet" ? "Advice" : "Public"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{doc.summary}</p>
                    <p className="mt-2 text-[11px] text-slate-500">{doc.topic} • {doc.serviceType}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeDoc ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">{activeDoc.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">{activeDoc.topic} • {activeDoc.serviceType}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={activeDoc.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
                  </a>

                  {activeDoc.category === "advice_sheet" ? (
                    <a
                      href={activeDoc.pdfUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Download advice sheet
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400"
                    >
                      <Download className="h-3.5 w-3.5" /> Download unavailable
                    </button>
                  )}
                </div>
              </div>

              <div className="h-160 p-4">
                <iframe
                  title={activeDoc.title}
                  src={`${activeDoc.pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                  className="h-full w-full rounded-xl border border-slate-200"
                />
              </div>
            </>
          ) : (
            <div className="px-6 py-20 text-center text-sm text-slate-500">Select a document to open it in the in-browser PDF viewer.</div>
          )}
        </div>
      </div>
    </div>
  );
};