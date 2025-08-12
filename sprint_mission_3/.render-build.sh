# .render-build.sh
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
node main.js