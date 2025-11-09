const ListRowSkeleton = () => {
  return (
    <tr>
      <th scope="row" className="text-center">
        <span className="placeholder col-6 placeholder-sm" />
      </th>
      <td className="text-center">
        <span
          className="placeholder rounded-pill bg-secondary"
          style={{ width: '80px', height: '20px', display: 'inline-block' }}
        />
      </td>
      <td className="text-center">
        <span className="placeholder col-8 placeholder-sm" />
      </td>
      <td className="text-center">
        <span className="placeholder col-8 placeholder-sm" />
      </td>
      <td className="text-center">
        <span className="placeholder col-6 placeholder-sm" />
      </td>
      <td className="text-center">
        <span className="placeholder col-6 placeholder-sm" />
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-2">
          <span
            className="placeholder btn btn-sm btn-secondary disabled"
            style={{ width: '30px', height: '30px' }}
          />
          <span
            className="placeholder btn btn-sm btn-secondary disabled"
            style={{ width: '30px', height: '30px' }}
          />
          <span
            className="placeholder btn btn-sm btn-danger disabled"
            style={{ width: '30px', height: '30px' }}
          />
        </div>
      </td>
    </tr>
  );
};

export default ListRowSkeleton;
