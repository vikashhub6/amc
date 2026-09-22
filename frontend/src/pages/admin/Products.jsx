import useFetch from "../../utils/useFetch";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

export default function AdminProducts() {
  const { data, loading } = useFetch("/products");
  const products = data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Products</h2>
        <p className="text-sm text-ink-500">
          Registered appliances covered by the service team.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : !products.length ? (
          <EmptyState
            title="No products yet"
            hint="Registered products will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Serial Number</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Installation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800">
                      {product.brand} {product.modelName}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {product.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {product.client?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {product.installationAddress || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
