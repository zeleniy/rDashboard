#
# Read .xlsx file.
#
x = readxl::read_excel("~/Downloads/CaselevelStats.xlsx")
#
# Convert to data frame.
#
x = as.data.frame(x)
#
# Find columns which names contains 'Case' substring.
#
#colnames(x)[grep('Case', colnames(x), T)]
#head(x[, colnames(x)[grep('Matter', colnames(x), T)]])
#
# Write it in .csv format.
#
write.table(x, "~/Projects/rDashboard/data/CaseStatsSummary.tsv", sep="\t", row.names = F)
