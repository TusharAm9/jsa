#!/bin/bash

# Admin Dashboard Setup Script
# This script helps set up the admin dashboard features

echo "🚀 Admin Dashboard Setup"
echo "======================="
echo ""

# Step 1: Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

# Step 2: Run Migrations
echo ""
echo "🔄 Running database migrations..."
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations may have already been applied"
fi

# Step 3: Verify Schema
echo ""
echo "✨ Verifying database schema..."
npx prisma db pull --force > /dev/null 2>&1
echo "✅ Schema verified"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Update your user role to ADMIN:"
echo "   Run: npx prisma studio"
echo "   Navigate to User table and change role to 'ADMIN'"
echo ""
echo "2. Start the dev server:"
echo "   npm run dev"
echo ""
echo "3. Access Admin Dashboard:"
echo "   Navigate to http://localhost:3000/admin"
echo ""
echo "For detailed guide, see ADMIN_GUIDE.md"
