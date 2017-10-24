#
# Read .xlsx file.
#
x = readxl::read_excel("~/Downloads/CaselevelStats.xlsx")
x = as.data.frame(x)
#
# Write it in .csv format.
#
write.table(x, "~/Projects/rDashboard/data/CaseStatsSummary.tsv", sep="\t", row.names = F)
