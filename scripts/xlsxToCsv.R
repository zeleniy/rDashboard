#
# Read .xlsx file.
#
x = readxl::read_excel("~/Downloads/Sample Data for Dashboards/CaseStatsSummary.xlsx")
#
# Write it in .csv format.
#
write.table(x, "~/Projects/rDashboard/data/CaseStatsSummary.tsv", sep="\t", row.names = F)
