# .render-build.sh
npx prisma generate
npx prisma db seed
node main.js