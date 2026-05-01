export default async function EditSoalPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Edit Soal</h1>
      <p>Edit soal dengan ID: {id}</p>
    </div>
  )
}
